import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import styles from "../styles";
import { ICardConfig } from "../types";
import { GithubEntity } from "./entity";

export class GithubFlexiCard extends LitElement {

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