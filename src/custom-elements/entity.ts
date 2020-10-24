import { HassEntity, HomeAssistant } from "../ha-types";
import { KeywordStringProcessor } from "../keyword-processor";
import { html, LitElement } from "../lit-element";
import { IEntityConfig, IMap } from "../types";
import { getConfigValue, logError, safeGetArray, safeGetConfigObject } from "../utils";
import styles from "./entity-styles";

interface IAttributeViewData {
    value: string,
    tooltip: string,
    icon?: string,
    label?: string,
    action?: Function,
}

export class GithubEntity extends LitElement {

    private config: IEntityConfig = <any>null;

    private icon: string = "mdi:github";

    private name: string = "";

    private secondaryInfo: string = <any>null;

    private attributesData: IAttributeViewData[] = [];

    private action: Function | undefined;

    private url: string | boolean | undefined;

    private compact_view: boolean = true;

    private entityData: HassEntity = <any>null;

    public attributesUpdated: boolean = false;

    /**
     * CSS for the card
     */
    static get styles() {
        return styles;
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

        this.attributesUpdated = false;

        this.entityData = hass.states[this.config.entity];

        this.processHassUpdate();
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

        this.name = config.name || config.entity;
        config.icon && (this.icon = config.icon);
        config.secondary_info && (this.secondaryInfo = config.secondary_info);

        this.compact_view = getConfigValue(<boolean>config.compact_view, true);

        // we want the dynamic data (e.g. in keyword-strings) to be populated right away
        this.entityData && this.processHassUpdate();
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

    getEntityAttributeValues(names: string[]): number[] {
        return names.map(n => this.entityData?.attributes[n] || 0);
    }

    private processHassUpdate() {
        if (!this.entityData) {
            logError("Entity not found: " + this.config.entity);
            return;
        }

        const keywordProcessor = new KeywordStringProcessor(this.entityData.attributes, this.entityData.state);

        this.name = keywordProcessor.process(this.config.name) || this.entityData.attributes["friendly_name"];
        this.icon = this.config.icon || this.entityData.attributes["icon"];

        if (this.config.secondary_info) {
            this.secondaryInfo = keywordProcessor.process(this.config.secondary_info) as string;
        }

        const newStats = getAttributesViewData(this.config, this.entityData.attributes, keywordProcessor);

        // check to avoid unnecessary re-rendering
        if (JSON.stringify(newStats) != JSON.stringify(this.attributesData)) {
            this.attributesData = newStats;
            this.attributesUpdated = true;
        }

        // check whether we need to update the action
        if (this.url != this.config.url) {
            this.url = this.config.url;
            this.action = getAction("home", this.url, this.entityData.attributes["path"], keywordProcessor);
        }
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
    "open_issues": "mdi:alert-circle-outline",
    "open_pull_requests": "mdi:source-pull",
    "stargazers": "mdi:star",
    "forks": "mdi:source-fork",
    "latest_release_tag": "mdi:tag-outline",
    "clones": "mdi:download-outline",
    "clones_unique": "mdi:download-outline",
    "views": "mdi:eye",
    "views_unique": "mdi:eye-check",
}

/**
 * Attribute name to url path map
 */
const nameToUrlPathMap: IMap<string> = {
    "open_issues": "issues",
    "open_pull_requests": "pulls",
    "stargazers": "stargazers",
    "forks": "network/members",
    "latest_release_tag": "releases",
    "clones": "graphs/traffic",
    "clones_unique": "graphs/traffic",
    "views": "graphs/traffic",
    "views_unique": "graphs/traffic",
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
 * Gets list of attributes data to render
 */
const getAttributesViewData = (config: IEntityConfig, data: IMap<string>, keywordProcessor: KeywordStringProcessor): IAttributeViewData[] =>
    safeGetArray(config.attributes).map(a => {
        // it can come as string so making sure it's an object
        a = safeGetConfigObject(a, "name");
        return {
            value: data[a.name],
            tooltip: attributeNameToTooltip(a.name),
            icon: a.icon || nameToIconMap[a.name],
            label: a.label && keywordProcessor.process(a.label),
            action: getAction(
                a.name,
                // if attrib url property is missing use the entity-level setting
                a.url !== undefined ? a.url : config.attribute_urls,
                data["path"],
                keywordProcessor
            ),
        }
    });

/**
 * Converts attribute name to formatted tooltip text
 */
const attributeNameToTooltip = (name: string): string => name.substr(0, 1).toUpperCase() + name.substr(1).replace(/_/g, " ");