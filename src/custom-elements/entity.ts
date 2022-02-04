import { HassEntity, HomeAssistant } from "../ha-types";
import { KeywordStringProcessor } from "../keyword-processor";
import { html, css, LitElement } from "../lit-element";
import { getConfigValue, logError, safeGetArray, safeGetConfigObject } from "../utils";
import styles from "./entity.css";

interface IAttributeViewData {
    value: string,
    tooltip: string,
    icon?: string,
    label?: string,
    action?: Function,
}

const repoEntitySuffixes = ["forks", "issues", "latest_commit", "latest_issue", "latest_pull_request", "latest_release", "pull_requests", "stars", "watchers"];

export class GithubEntity extends LitElement {

    // View properties start

    private icon: string = "mdi:github";

    private name: string = "";

    private secondaryInfo: string = <any>null;

    private attributesData: IAttributeViewData[] = [];

    private action: Function | undefined;

    private compact_view: boolean = true;

    // View properties end

    private config: IEntityConfig = <any>null;

    private url: string | boolean | undefined;

    private _hass: HomeAssistant;

    private entityPrefix: string;

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
            name: { type: String },
            secondaryInfo: { type: String },
            attributesData: { type: Array },
            action: { type: Function },
            compact_view: { type: Boolean },
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

        if (!config.entity) {
            logError("Missing 'entity' property in entity configuration");
            return;
        }

        // we cannot just assign the config because it is immutable and we want to change it
        this.config = JSON.parse(newConfig);

        this.entityPrefix = getEntityNamePrefix(this.config.entity);

        this.name = config.name || config.entity; // TODO think about creating the proper name
        config.icon && (this.icon = config.icon);
        config.secondary_info && (this.secondaryInfo = config.secondary_info);

        this.compact_view = getConfigValue(<boolean>config.compact_view, true);

        // we want the dynamic data (e.g. in keyword-strings) to be populated right away
        this._hass && this.processHassUpdate();
    }

    /**
     * Called when element rendering was triggered
     */
    render() {
        return html`
        <div class="entity-row${this.compact_view ? " compact-view" : ""}">
            <div class="icon">
                <ha-icon icon="${this.icon}"></ha-icon>
            </div>
            <div class="name truncate${this.action ? " clickable" : ""}" @click="${this.action}">
                ${this.name}
                ${this.secondaryInfo && html`<div class="secondary">${this.secondaryInfo}</div>`}
            </div>
            ${this.attributesData.map(attributeView)}
        <div>
        `;
    }

    /**
     * Returns value of the given repo property
     * @param name Name of the property to return
     */
    getRepoInfo(name: string): string {

        switch (name) {
            case "path":
                return this.repoPath;
            case "owner":
                return this.repoPath.split("/")[0];
            case "repo":
                return this.repoPath.split("/")[1];
        }

        const suffix = repoEntitySuffixes.find(s => name.startsWith(s));
        if (suffix === undefined) {
            logError("Unsupported property", true);
        }

        const entity = this._hass.states[this.entityPrefix + "_" + suffix];

        if (!entity) {
            logError("Entity not found: " + this.entityPrefix + "_" + suffix, true);
        }

        if (suffix == name) {
            return entity.state;
        }
        else {
            // removing suffix with underscore to get the attrib name
            return entity.attributes[name.substr(suffix!.length + 1)];
        }
    }

    /**
     * Triggered whenever sonfig or hass updates/changes
     */
    private processHassUpdate() {

        const entity = this._hass.states[this.config.entity];

        const friendlyName = <string>entity.attributes["friendly_name"];
        this.repoPath = friendlyName.substr(0, friendlyName.indexOf(" "));

        const keywordProcessor = new KeywordStringProcessor(match => this.getRepoInfo(match));

        this.name = keywordProcessor.process(this.config.name) || this.repoPath;
        this.icon = this.config.icon || entity.attributes["icon"];

        if (this.config.secondary_info) {
            this.secondaryInfo = keywordProcessor.process(this.config.secondary_info) as string;
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
    }

    /**
     * Generates attributes collection to display
     * @param keywordProcessor KString processor
     */
    private getAttributesViewData(keywordProcessor: KeywordStringProcessor) {
        return safeGetArray(this.config.attributes).map(a => {
            // it can come as string so making sure it's an object
            a = safeGetConfigObject(a, "name");
            return {
                value: this.getRepoInfo(a.name),
                tooltip: attributeNameToTooltip(a.name),
                icon: a.icon || nameToIconMap[a.name],
                label: a.label && keywordProcessor.process(a.label),
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
    ${attr.label && html`<div class="label">${attr.label}</div>`}
    ${(attr.icon && !attr.label) ? html`<ha-icon icon="${attr.icon}" style="color: var(--primary-color)"></ha-icon>` : null}
    <div>${attr.value}</div>
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
const getAction = (attributeName: string, url: boolean | string | undefined, path: string, keywordProcessor: KeywordStringProcessor): Function | undefined => {
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
 * Gets the entity name prefix
 *
 * @param entity Source entity name
 * @description
 *      Github integration for every repo creates entities with a common prefix. This function
 *      converts any original entity name to the common prefix.
 */
const getEntityNamePrefix = (entity: string): string => {
    const suffix = repoEntitySuffixes.find(s => entity.endsWith(s));
    return suffix !== undefined ? entity.replace("_" + suffix, "") : entity;
}