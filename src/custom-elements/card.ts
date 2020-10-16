import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import { ICardConfig, IEntityConfig } from "../types";
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
            this.entities = cardConfig.entities.map(e => getEntityConfig(e, cardConfig)).map(entityConf => {
                const elem = document.createElement("github-entity") as GithubEntity;
                elem.setConfig(entityConf);
                return elem;
            })
        }
        else {
            this.entities.forEach((entity, index) => entity.setConfig(getEntityConfig(cardConfig.entities[index], cardConfig)));
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

/**
 * Converts string entry to proper config obj and applies card-level settings
 */
const getEntityConfig = (configEntry: IEntityConfig | string, cardConfig: ICardConfig): IEntityConfig => {

    const entityConfig = typeof configEntry != "string" ?
        // we have to make a copy as the original one is immutable
        { ...configEntry } :
        // construct simple config entry
        { entity: configEntry };

    // if property is not defined take the card-level one
    entityConfig.attributes = entityConfig.attributes || cardConfig.attributes;
    entityConfig.attribute_urls = entityConfig.attribute_urls !== undefined ? entityConfig.attribute_urls : cardConfig.attribute_urls;
    entityConfig.icon = entityConfig.icon || cardConfig.icon;
    entityConfig.name = entityConfig.name || cardConfig.name;
    entityConfig.secondary_info = entityConfig.secondary_info || cardConfig.secondary_info;
    entityConfig.url = entityConfig.url !== undefined ? entityConfig.url : cardConfig.url;

    return entityConfig;
}