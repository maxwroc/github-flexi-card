import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import { ICardConfig } from "../types";
import { GithubEntity } from "./entity";
import styles from "./styles";

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

    setConfig(cardConfig: ICardConfig) {
        this.cardTitle = cardConfig.title;

        if (this.entities.length != cardConfig.entities.length) {
            this.entities = cardConfig.entities.map(entityConf => {
                const elem = document.createElement("github-entity") as GithubEntity;

                // we have to make a copy as the original one is immutable
                const updatableConfig = { ...entityConf };

                // if property is not defined take the card-level one
                updatableConfig.attributes = updatableConfig.attributes || cardConfig.attributes;
                updatableConfig.attribute_urls = updatableConfig.attribute_urls !== undefined ? updatableConfig.attribute_urls : cardConfig.attribute_urls;
                updatableConfig.icon = updatableConfig.icon || cardConfig.icon;
                updatableConfig.name = updatableConfig.name || cardConfig.name;
                updatableConfig.secondary_info = updatableConfig.secondary_info || cardConfig.secondary_info;
                updatableConfig.url = updatableConfig.url !== undefined ? updatableConfig.url : cardConfig.url;

                elem.setConfig(updatableConfig);
                return elem;
            })
        }
        else {
            this.entities.forEach((entity, index) => entity.setConfig(cardConfig.entities[index]));
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