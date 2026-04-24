import { HomeAssistant } from "../ha-types";
import { html, css, LitElement } from "../lit-element";
import { RichStringProcessor } from "../rich-string-processor";
import { logError, getConfigValue, safeGetConfigArrayOfObjects, resetLogCache, isNumber, findDeviceIdByRepo, findEntitiesByDeviceId } from "../utils";
import styles from "./repo.css";

interface IAttributeViewData {
    value: string,
    tooltip: string,
    icon?: string,
    label?: string,
    action?: Function,
    color?: string,
}

const translationKeyToEntityKey: Record<string, string> = {
    "forks_count": "forks",
    "issues_count": "issues",
    "latest_commit": "latest_commit",
    "latest_issue": "latest_issue",
    "latest_pull_request": "latest_pull_request",
    "latest_release": "latest_release",
    "latest_tag": "latest_tag",
    "merged_pulls_count": "pull_requests",
    "stargazers_count": "stars",
    "subscribers_count": "watchers",
    "discussions_count": "discussions",
    "latest_discussion": "latest_discussion",
};

export class GithubRepo extends LitElement {

    public repoName: string;

    // View properties start

    private icon: string = "mdi:github";

    private iconColor: string = "var(--paper-item-icon-color)";

    private name: string = "";

    private secondaryInfo: string | Date | undefined;

    private attributesData: IAttributeViewData[] = [];

    private action: Function | undefined;

    private compact_view: boolean = true;

    private debugData: string | undefined;

    // View properties end

    private config: IEntityConfig;

    private url: string | boolean | undefined;

    private _hass: HomeAssistant;

    private entityMap: IMap<string> = {};

    private repoPath: string;

    /**
     * CSS for the card
     */
    static get styles() {
        return css([styles]);
    }

    /**
     * List of properties which trigger update when changed
     */
    static get properties() {
        return {
            icon: { type: String },
            iconColor: { type: String },
            name: { type: String },
            secondaryInfo: { type: String },
            attributesData: { type: Array },
            action: { type: Function },
            compact_view: { type: Boolean },
            debugData: { type: String },
        };
    }

    /**
     * Called whenever HS state is updated
     */
    set hass(hass: HomeAssistant) {

        if (!this.config) {
            return;
        }

        this._hass = hass;

        this.config && this.processHassUpdate();
    }

    /**
     * Called whenever card config is updated
     */
    setConfig(config: IEntityConfig) {
        const oldConfig = JSON.stringify(this.config);
        const newConfig = JSON.stringify(config);

        if (oldConfig == newConfig) {
            return;
        }

        resetLogCache();

        if (!config.repo) {
            logError("Missing 'repo' property in entity configuration");
            return;
        }

        this.repoName = config.repo;

        // we cannot just assign the config because it is immutable and we want to change it
        this.config = JSON.parse(newConfig);

        this.name = config.name || config.repo;
        config.icon && (this.icon = config.icon);
        config.icon_color && (this.iconColor = config.icon_color);
        config.secondary_info && (this.secondaryInfo = config.secondary_info);

        this.compact_view = getConfigValue(<boolean>config.compact_view, true);

        // we want the dynamic data (e.g. in keyword-strings) to be populated right away
        this._hass && this.processHassUpdate();
    }

    /**
     * Called when element rendering was triggered
     */
    render() {
        if (this.debugData) {
            return debugOutput(this.config.repo, this.debugData);
        }

        return html`
        <div class="entity-row${this.compact_view ? " compact-view" : ""}">
            <div class="icon">
                <ha-icon icon="${this.icon}" style="color: ${this.iconColor}"></ha-icon>
            </div>
            <div class="name truncate${this.action ? " clickable" : ""}" @click="${this.action}">
                ${this.name}
                ${this.secondaryInfo instanceof Date ? secondaryInfoTime(this._hass, this.secondaryInfo) : secondaryInfo(this.secondaryInfo)}
            </div>
            ${this.attributesData.map(attributeView)}
        <div>
        `;
    }

    /**
     * Returns value of the given repo property
     * @param name Name of the property to return
     */
    getRepoInfo(name: string): string | undefined {

        switch (name) {
            case "path":
                return this.repoPath;
            case "owner":
                return this.repoPath.split("/")[0];
            case "repo":
                return this.repoPath.split("/")[1];
        }

        if (!(name in this.entityMap)) {
            console.log(this.entityMap)
            logError("Unsupported property: " + name, true);
        }

        const entityId = this.entityMap[name];

        if (!entityId) {
            logError("Entity not found for: " + name);
            return;
        }

        const entity = this._hass.states[entityId];

        if (!entity) {
            logError("Entity state not found: " + entityId);
            return;
        }

        return entity.state;
    }

    /**
     * Triggered whenever sonfig or hass updates/changes
     */
    private processHassUpdate() {

        // Resolve device and entities from repo name
        const deviceId = findDeviceIdByRepo(this._hass, this.config.repo);
        if (!deviceId) {
            logError("[processHassUpdate] Device not found for repo: " + this.config.repo, true);
            return;
        }

        const entityIds = findEntitiesByDeviceId(this._hass, deviceId);

        if (Object.keys(this.entityMap).length === 0) {
            // Build a map of repo property -> entity_id for quick lookup
            for (const entityId of entityIds) {
                const translationKey = this._hass.entities[entityId]?.translation_key;
                if (translationKey && translationKeyToEntityKey[translationKey]) {
                    const key = translationKeyToEntityKey[translationKey];
                    this.entityMap[key] = entityId;
                }
            }
        }

        this.repoPath = this.config.repo;

        const keywordProcessor = new RichStringProcessor(match => this.getRepoInfo(match));

        this.name = keywordProcessor.process(this.config.name) || this.repoPath;
        this.icon = this.config.icon || "mdi:github";

        if (this.config.secondary_info) {

            let secondaryInfo: string | Date | undefined = keywordProcessor.process(this.config.secondary_info);

            if (secondaryInfo != undefined) {
                // check if this can be a date
                // condition is little bit weird but we don't want accidental values to be converted to date like "0.8.4"
                if (secondaryInfo.length > 20) {
                    const dateTime = Date.parse(secondaryInfo);
                    if (!isNaN(dateTime)) {
                        secondaryInfo = new Date(dateTime);
                    }
                }

                this.secondaryInfo = secondaryInfo;
            }
        }

        const newStats = this.getAttributesViewData(keywordProcessor);

        // check to avoid unnecessary re-rendering
        if (JSON.stringify(newStats) != JSON.stringify(this.attributesData)) {
            this.attributesData = newStats;
        }

        // check whether we need to update the action
        if (this.url != this.config.url) {
            this.url = this.config.url;
            this.action = getAction("home", this.url, this.repoPath, keywordProcessor);
        }

        // debug output
        if (this.config.debug === true || this.config.debug === this.config.repo) {
            const debugInfo: IMap<any> = {
                config: this.config,
                entityMap: this.entityMap,
                entities: {},
            };

            for (const [key, entityId] of Object.entries(this.entityMap)) {
                debugInfo.entities[key] = this._hass.states[entityId] || null;
            }

            this.debugData = JSON.stringify(debugInfo, null, 2);
        }
        else {
            this.debugData = undefined;
        }
    }

    /**
     * Generates attributes collection to display
     * @param keywordProcessor KString processor
     */
    private getAttributesViewData(keywordProcessor: RichStringProcessor): IAttributeViewData[] {
        return safeGetConfigArrayOfObjects(this.config.attributes, "name")
            .map(a => {
                const val = this.getRepoInfo(a.name);
                return <IAttributeViewData>{
                    value: val === undefined ? "?" : val,
                    tooltip: attributeNameToTooltip(a.name),
                    icon: a.icon || nameToIconMap[a.name],
                    label: a.label && keywordProcessor.process(a.label),
                    color: a.color || this.config.attribute_color || "var(--primary-color)",
                    action: getAction(
                        a.name,
                        // if attrib url property is missing use the entity-level setting
                        a.url !== undefined ? a.url : this.config.attribute_urls,
                        this.repoPath,
                        keywordProcessor
                    ),
                }
            });
    }
}

/**
 * View for single attribute
 */
const attributeView = (attr: IAttributeViewData) => html`
<div class="state${attr.action ? " clickable" : ""}" @click="${attr.action}" title="${attr.tooltip}">
    ${attr.label && html`<div class="label" style="color: ${attr.color}">${attr.label}</div>`}
    ${(attr.icon && !attr.label) ? html`<ha-icon icon="${attr.icon}" style="color: ${attr.color}"></ha-icon>` : null}
    <div>${attr.value}</div>
</div>
`;

const secondaryInfo = (text?: string) => text && html`
<div class="secondary">${text}</div>
`;

const secondaryInfoTime = (hass: HomeAssistant | undefined, time?: Date) => time && html`
<div class="secondary">
    <ha-relative-time .hass="${hass}" .datetime="${time}"></ha-relative-time>
</div>
`;

/**
 * Attribute name to icon map
 */
const nameToIconMap: IMap<string> = {
    "forks": "mdi:source-fork",
    "issues": "mdi:alert-circle-outline",
    "pull_requests": "mdi:source-pull",
    "stars": "mdi:star",
    "latest_release": "mdi:tag-outline",
    "watchers": "mdi:glasses",
    // "clones": "mdi:download-outline",
    // "clones_unique": "mdi:download-outline",
    // "views": "mdi:eye",
    // "views_unique": "mdi:eye-check",
}

/**
 * Attribute name to url path map
 */
const nameToUrlPathMap: IMap<string> = {
    "forks": "network/members",
    "issues": "issues",
    "pull_requests": "pulls",
    "stars": "stargazers",
    "latest_release": "releases",
    "watchers": "watchers",
    // "clones": "graphs/traffic",
    // "clones_unique": "graphs/traffic",
    // "views": "graphs/traffic",
    // "views_unique": "graphs/traffic",
    "home": ""
}

/**
 * Creates action for clickable elements
 */
const getAction = (attributeName: string, url: boolean | string | undefined, path: string, keywordProcessor: RichStringProcessor): Function | undefined => {
    switch (typeof url) {
        case "boolean":
            if (!url) {
                return undefined;
            }

            if (!path) {
                logError(`Cannot build url - entity path attribute is missing`);
                return undefined;
            }

            if (!nameToUrlPathMap[attributeName] === undefined) {
                logError(`Sorry url cannot be built for "${attributeName}"`);
                return undefined;
            }

            return () => window.open(`https://github.com/${path}/${nameToUrlPathMap[attributeName]}`);
        case "string":
            return () => window.open(keywordProcessor.process(url));
        case "undefined":
            // we don't do anything
            break;
        default:
            logError("Unsupported url type: " + typeof url);
    }

    return undefined;
}

/**
 * Converts attribute name to formatted tooltip text
 */
const attributeNameToTooltip = (name: string): string => name.substr(0, 1).toUpperCase() + name.substr(1).replace(/_/g, " ");

/**
 * Renders debug output with show/hide toggle and copy-to-clipboard
 */
const debugOutput = (repoName: string, content: string) => {
    const toggleDebug = (e: MouseEvent) => {
        const debugContent = (<HTMLElement>(<HTMLElement>e.currentTarget)?.parentElement?.parentElement?.querySelector(".debug_expand"));
        if (debugContent) {
            debugContent.style.display = debugContent.style.display === "none" ? "block" : "none";
        }
    };

    const copyToClipboard = () => navigator.clipboard?.writeText(content);

    return html`
    <ha-alert alert-type="warning" title="Debug: ${repoName}">
        <div>
            [<a href="javascript:void(0);" @click="${toggleDebug}">Show / hide</a>]
            ${navigator.clipboard ? html` [<a href="javascript:void(0);" @click="${copyToClipboard}">Copy to clipboard</a>]` : ""}
        </div>
        <div class="debug_expand" style="display: none;">
            <p>Version: [VI]{version}[/VI]</p>
            <pre style="user-select: all">${content}</pre>
        </div>
    </ha-alert>`;
};