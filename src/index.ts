import { LitElement, html } from "./lit-element";
import { HomeAssistant } from "./ha-types";
import { ICardConfig, IEntityConfig } from "./types";
import styles from "./styles";

class GithubFlexiCard extends LitElement {

    private cardTitle: string = "";

    private entities: GithubEntity[] = [];

    /**
     * CSS for the card
     */
    static get styles() {
        return styles;
    }

    static get properties() {
        return {
            cardTitle: { type: String },
            entities: { type: Array },
        };
    }

    set hass(hass: HomeAssistant) {
        this.entities.forEach(entity => entity.hass = hass);
    }

    setConfig(config: ICardConfig) {
        this.cardTitle = config.title;

        if (this.entities.length != config.entities.length) {
            this.entities = config.entities.map(entity => {
                const elem = document.createElement("github-entity") as GithubEntity;
                elem.setConfig(entity);
                return document.createElement("github-entity") as GithubEntity;
            })
        }
        else {
            this.entities.forEach((entity, index) => entity.setConfig(config.entities[index]));
        }
    }

    render() {
        return html`
        <ha-card>
            ${this.getHeader()}
            <div class="card-content">
                ${this.entities}
            </div>
        </ha-card>
        `;
    }

    private getHeader() {
        return this.cardTitle && html`
        <div class="card-header">
            <div class="truncate">
                ${this.cardTitle}
            </div>
        </div>
        `;
    }
}

// Registering card
customElements.define("github-flexi-card", GithubFlexiCard);


const replaceKeywordsWithData = (text: string, data: { [key: string]: string }) =>
    text.replace(/\{([a-z]+)\}/g, (match, keyword) => data[keyword] !== undefined ? data[keyword] : match);

class GithubEntity extends LitElement {

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
                ${this.getSecondaryInfo()}
            </div>
            <div class="state">
                State
            </div>
        <div>
        `;
    }

    private getSecondaryInfo() {
        return this.secondaryInfo && html`<div class="secondary">${this.secondaryInfo}</div>`;
    }
}

customElements.define("github-entity", GithubEntity);

/*
  "sensor.battery_state_card" : {
    "entity_id": "sensor.battery_state_card",
    "state": "1d345503",
    "attributes": {
      "path": "maxwroc/battery-state-card",
      "name": "battery-state-card",
      "latest_commit_message": "Merge pull request #137 from maxwroc/dependabot/npm_and_yarn/tslib-2.0.2\n\nBump tslib from 2.0.1 to 2.0.2",
      "latest_commit_sha": "d6ab05b072a3c8471e051d64ce6de5170bd3d17c",
      "latest_release_url": "https://github.com/maxwroc/battery-state-card/releases/tag/v1.5.0",
      "latest_open_issue_url": "https://github.com/maxwroc/battery-state-card/pull/142",
      "open_issues": 2,
      "latest_open_pull_request_url": "https://github.com/maxwroc/battery-state-card/pull/142",
      "open_pull_requests": 1,
      "stargazers": 109,
      "forks": 5,
      "latest_release_tag": "v1.5.0",
      "clones": 68,
      "clones_unique": 14,
      "views": 1198,
      "views_unique": 556,
      "friendly_name": "battery-state-card",
      "icon": "mdi:github"
    }
  }

*/