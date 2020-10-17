import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import { ICardConfig, IEntityConfig } from "../types";
import { GithubEntity } from "./entity";
import styles from "./card-styles";

export class GithubFlexiCard extends LitElement {

    private cardTitle: string = "";

    private entities: GithubEntity[] = [];

    private cardSize = 0;

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
            cardTitle: { type: String },
            entities: { type: Array },
        };
    }

    /**
     * Called whenever HS state is updated
     */
    set hass(hass: HomeAssistant) {
        this.entities.forEach(entity => entity.hass = hass);
    }

    /**
     * Called whenever card config is updated
     */
    setConfig(cardConfig: ICardConfig) {
        this.cardTitle = cardConfig.title;

        this.cardSize = 0;

        if (this.cardTitle) {
            this.cardSize++;
        }

        if (this.entities.length != cardConfig.entities.length) {
            this.entities = cardConfig.entities.map(e => getEntityConfig(e, cardConfig)).map(entityConf => {
                const elem = document.createElement("github-entity") as GithubEntity;
                elem.setConfig(entityConf);
                this.cardSize++;
                return elem;
            })
        }
        else {
            this.entities.forEach((entity, index) => entity.setConfig(getEntityConfig(cardConfig.entities[index], cardConfig)));
        }
    }

    /**
     * Gets the height of your card.
     *
     * Home Assistant uses this to automatically distribute all cards over
     * the available columns. One is equal 50px.
     */
    getCardSize() {
        return this.cardSize;
    }

    /**
     * Called when element rendering was triggered
     */
    render() {
        return html`
        <ha-card>
            ${this.cardTitle && header(this.cardTitle)}
            <div class="card-content">
                ${this.entities}
            </div>
        </ha-card>
        `;
    }
}

/**
 * Header/title view
 */
const header = (title: string) => html`
<div class="card-header">
    <div class="truncate">
        ${title}
    </div>
</div>
`;

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