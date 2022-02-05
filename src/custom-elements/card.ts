import { HomeAssistant } from "../ha-types";
import { html, css, LitElement } from "../lit-element";
import { GithubEntity } from "./entity";
import { defaultConfig } from "../default-config"
import styles from "./card.css";
import { getConfigValue, safeGetArray, safeGetConfigArrayOfObjects, safeGetConfigObject } from "../utils";

export class GithubFlexiCard extends LitElement {

    private cardTitle: string | undefined | null;

    private entities: GithubEntity[] = [];

    private cardSize = 0;

    private sortOptions?: ISortOptions[];

    private order: number[] = [];

    private config: ICardConfig;

    /**
     * CSS for the card
     */
    static get styles() {
        return css([styles]);
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

        if (this.config.auto) {

            const initializedEntities = this.entities.map(e => e.entityId);

            Object.keys(hass.states).filter(entityId => entityId.endsWith(<string>this.config.auto)).forEach(entityId => {
                // only adding entities which were not initialized already
                if (!initializedEntities.includes(entityId)) {
                    this.entities.push(this.getNewInitializedEntity(entityId));
                }
            });

            // we don't want to process the list more than once
            this.config.auto = false;
        }

        this.entities.forEach(entity => entity.hass = hass);

        if (this.sortOptions && this.sortOptions.length) {
            const attrNames = this.sortOptions.map(s => s.by);
            const values = this.entities.map(e =>
                attrNames.map(attr => Number(e.getRepoInfo(attr))));

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

        cardConfig = {
            ...defaultConfig,
            ...cardConfig
        }

        this.cardTitle = cardConfig.title;

        const prevEntitiesInConfig = this.config?.entities;

        this.config = cardConfig;

        this.cardSize = 0;

        if (this.cardTitle) {
            this.cardSize++;
        }

        const entitiesFromConfig = safeGetConfigArrayOfObjects(cardConfig.entities, "entity");

        if (prevEntitiesInConfig != cardConfig.entities) {
            this.order = [];
            this.entities = entitiesFromConfig.map(entityConf => this.getNewInitializedEntity(entityConf));
        }
        else {
            this.entities.forEach((entity, index) => {
                const entityConf = getEntityConfig(entitiesFromConfig[index] || entity.entityId, cardConfig);
                entity.setConfig(entityConf);
            });
        }

        const sortOptions = safeGetArray(cardConfig.sort).map(s => safeGetConfigObject(s, "by"))
        this.sortOptions = sortOptions;
    }

    private getNewInitializedEntity(confEntry: string | IEntityConfig): GithubEntity {

        const entityConf = getEntityConfig(confEntry, this.config);

        this.order.push(this.order.length);

        const elem = document.createElement("github-entity") as GithubEntity;
        elem.setConfig(entityConf);
        this.cardSize++;

        return elem;
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
                ${this.order.map(i => html`<div>${this.entities[i]}</div>`)}
            </div>
        </ha-card>
        `;
    }
}

/**
 * Swaps sorting option depending on a given param
 * @param a Value A
 * @param b Value B
 * @param ascending Whether to reverse sort
 */
const applySortType = (a: number, b: number, ascending?: boolean) => {
    // NaN values placed at the bottom of the list
    if (isNaN(a)) return 1;
    if (isNaN(b)) return -1;

    return ascending ? a - b : b - a;
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
    entityConfig.attribute_color = getConfigValue(entityConfig.attribute_color, cardConfig.attribute_color);
    entityConfig.icon = getConfigValue(entityConfig.icon, cardConfig.icon);
    entityConfig.icon_color = getConfigValue(entityConfig.icon_color, cardConfig.icon_color);
    entityConfig.name = getConfigValue(entityConfig.name, cardConfig.name);
    entityConfig.secondary_info = getConfigValue(entityConfig.secondary_info, cardConfig.secondary_info);
    entityConfig.url = getConfigValue(entityConfig.url, cardConfig.url);
    entityConfig.compact_view = getConfigValue(entityConfig.compact_view, cardConfig.compact_view, true);

    return entityConfig;
}