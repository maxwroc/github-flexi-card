import { HomeAssistant } from "../ha-types";
import { html, LitElement } from "../lit-element";
import { ICardConfig, IEntityConfig, ISortOptions } from "../types";
import { GithubEntity } from "./entity";
import styles from "./card-styles";
import { getConfigValue, safeGetArray, safeGetConfigObject } from "../utils";

export class GithubFlexiCard extends LitElement {

    private cardTitle: string = "";

    private entities: GithubEntity[] = [];

    private cardSize = 0;

    private sortOptions?: ISortOptions[];

    private order: number[] = [];

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
            order: { type: Array },
        };
    }

    /**
     * Called whenever HS state is updated
     */
    set hass(hass: HomeAssistant) {
        this.entities.forEach(entity => entity.hass = hass);

        if (this.sortOptions && this.sortOptions.length) {
            const attrNames = this.sortOptions.map(s => s.by);
            const values = this.entities.map(e => e.getEntityAttributeValues(attrNames));

            const applySortType = (a: number, b: number, ascending?: boolean) => ascending ? a - b : b - a;

            // default order matches the config
            const defaultOrder = this.entities.map((e, i) => i);
            const newOrder = defaultOrder.sort(
                (a, b) => values[a].reduce(
                    (prev, curr, i) => prev != 0 ? prev : applySortType(curr, values[b][i], this.sortOptions![i].ascending),
                    0
                )
            );

            // check if order has changed
            if (this.order.some((v, i) => v != newOrder[i])) {
                // trigger update
                this.order = newOrder;
            }
        }
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
            });
        }
        else {
            this.entities.forEach((entity, index) => entity.setConfig(getEntityConfig(cardConfig.entities[index], cardConfig)));
        }

        this.order = this.entities.map((e, i) => i);

        const sortOptions = safeGetArray(cardConfig.sort).map(s => safeGetConfigObject(s, "by"))
        this.sortOptions = sortOptions;
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
                ${this.order.map(i => this.entities[i])}
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

    const entityConfig = safeGetConfigObject(configEntry, "entity");

    // if property is not defined take the card-level one
    entityConfig.attributes = getConfigValue(entityConfig.attributes, cardConfig.attributes);
    entityConfig.attribute_urls = getConfigValue(entityConfig.attribute_urls, cardConfig.attribute_urls);
    entityConfig.icon = getConfigValue(entityConfig.icon, cardConfig.icon);
    entityConfig.name = getConfigValue(entityConfig.name, cardConfig.name);
    entityConfig.secondary_info = getConfigValue(entityConfig.secondary_info, cardConfig.secondary_info);
    entityConfig.url = getConfigValue(entityConfig.url, cardConfig.url);
    entityConfig.compact_view = getConfigValue(entityConfig.compact_view, cardConfig.compact_view, true);

    return entityConfig;
}