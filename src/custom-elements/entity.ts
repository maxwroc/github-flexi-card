import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import { IEntityConfig } from "../types";

const replaceKeywordsWithData = (text: string, data: { [key: string]: string }) =>
    text.replace(/\{([a-z]+)\}/g, (match, keyword) => data[keyword] !== undefined ? data[keyword] : match);

export class GithubEntity extends LitElement {

    private config: IEntityConfig = <any>null;

    private icon: string = "mdi:lightbulb";

    private name: string = "";

    private secondaryInfo: string = <any>null;

    static get properties() {
        return {
            icon: { type: String },
            name: { type: String },
            secondaryInfo: { type: String },
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
        <div class="state">
            State
        </div>
    <div>
    `;
    }
}