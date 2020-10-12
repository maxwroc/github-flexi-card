import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import { IEntityConfig, IAttribute } from "../types";
import { logError } from "../utils";

const replaceKeywordsWithData = (data: IMap<string>, text?: string) =>
    text && text.replace(/\{([a-z0-9_]+)\}/g, (match, keyword) => data[keyword] !== undefined ? data[keyword] : match);

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
}

/**
 * Creates action for clickable elements
 */
const getAction = (attributeName: string, url: boolean | string | undefined, data: IMap<string>): Function | undefined => {
    switch (typeof url) {
        case "boolean":
            if (!url) {
                return undefined;
            }

            if (!data["path"]) {
                logError(`Cannot build url - entity path attribute is missing`);
                return undefined;
            }

            if (!nameToUrlPathMap[attributeName]) {
                logError(`Sorry url cannot be built for "${attributeName}"`);
                return undefined;
            }

            return () => window.open(`https://github.com/${data["path"]}/${nameToUrlPathMap[attributeName]}`);
        case "string":
            return () => window.open(replaceKeywordsWithData(data, url));
        case "undefined":
            // we don't do anything
            break;
        default:
            logError("Unsupported url type: " + typeof url);
    }

    return undefined;
}

const getStats = (attrib: IAttribute[], data: IMap<string>): IStat[] =>
    attrib.map(a => {
        return {
            value: data[a.name],
            icon: a.icon || nameToIconMap[a.name],
            label: a.label && replaceKeywordsWithData(data, a.label),
            action: getAction(a.name, a.url, data),
        }
    });

export class GithubEntity extends LitElement {

    private config: IEntityConfig = <any>null;

    private icon: string = "mdi:lightbulb";

    private name: string = "";

    private secondaryInfo: string = <any>null;

    private stats: IStat[] = [];

    static get properties() {
        return {
            icon: { type: String },
            name: { type: String },
            secondaryInfo: { type: String },
            stats: { type: Array },
        };
    }

    set hass(hass: HomeAssistant) {

        if (!this.config.entity_id) {
            console.error("[github-flexi-card] Missing entity_id property in entity configuration");
            return;
        }

        const entityData = hass.states[this.config.entity_id];
        if (!entityData) {
            console.error("[github-flexi-card] Entity not found: " + this.config.entity_id);
            return;
        }

        this.name = replaceKeywordsWithData(entityData.attributes, this.config.name) || entityData.attributes["friendly_name"];
        this.icon = this.config.icon || entityData.attributes["icon"];

        if (this.config.secondary_info) {
            this.secondaryInfo = replaceKeywordsWithData(entityData.attributes, this.config.secondary_info) as string;
        }

        const newStats = getStats(this.config.attributes || [], entityData.attributes);
        // check to avoid unnecessary re-rendering
        if (JSON.stringify(newStats) != JSON.stringify(this.stats)) {
            this.stats = newStats;
        }
    }

    setConfig(config: IEntityConfig) {
        const oldConfig = JSON.stringify(this.config);
        const newConfig = JSON.stringify(config);

        if (oldConfig != newConfig) {
            this.config = config;

            this.name = config.name || config.entity_id;
            config.icon && (this.icon = config.icon);
            config.secondary_info && (this.secondaryInfo = config.secondary_info);
        }
    }

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
        <div class="entity-row compact-view">
            <div class="icon">
                <ha-icon icon="${this.icon}"></ha-icon>
            </div>
            <div class="name truncate">
                ${this.name}
                ${this.secondaryInfo && html`<div class="secondary">${this.secondaryInfo}</div>`}
            </div>
            ${this.stats.map(s => html`<div class="state${s.action ? " clickable" : ""}" @click="${s.action}"><ha-icon icon="${s.icon}" style="color: var(--primary-color)"></ha-icon><div>${s.value}</div></div>`)}
        <div>
        `;
    }
}

interface IMap<T> {
    [key: string]: T
}

interface IStat {
    value: string,
    icon?: string,
    label?: string,
    action?: Function,
}