import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import { IEntityConfig, IAttribute } from "../types";

const replaceKeywordsWithData = (text: string, data: IMap<string>) =>
    text.replace(/\{([a-z]+)\}/g, (match, keyword) => data[keyword] !== undefined ? data[keyword] : match);

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

const getStats = (attrib: IAttribute[], data: IMap<string>): IStat[] =>
    attrib.map(a => {
        return {
            icon: a.icon || nameToIconMap[a.name],
            label: a.label && replaceKeywordsWithData(a.label, data),
            url: a.url && replaceKeywordsWithData(a.url, data),
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

        this.name = this.config.name || entityData.attributes["friendly_name"];
        this.icon = this.config.icon || entityData.attributes["icon"];

        if (this.config.secondary_info) {
            this.secondaryInfo = replaceKeywordsWithData(this.config.secondary_info, entityData.attributes);
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
    <div class="entity-row">
        <div class="icon">
            <ha-icon
                icon="${this.icon}"
            ></ha-icon>
        </div>
        <div class="name truncate">
            ${this.name}
            ${this.secondaryInfo && html`<div class="secondary">${this.secondaryInfo}</div>`}
        </div>
        ${this.stats.map(s => html`<div class="state"><ha-icon icon="${s.icon}"></ha-icon> <span>${s.label}</span></div>`)}
    <div>
    `;
    }
}

interface IMap<T> {
    [key: string]: T
}

interface IStat {
    icon?: string,
    label?: string,
    url?: string,
}