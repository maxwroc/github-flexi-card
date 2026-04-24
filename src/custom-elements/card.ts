import { HomeAssistant } from "../ha-types";
import { html, css, LitElement } from "../lit-element";
import { GithubRepo } from "./repo";
import { defaultConfig } from "../default-config"
import styles from "./card.css";
import { getConfigValue, safeGetArray, safeGetConfigArrayOfObjects, safeGetConfigObject } from "../utils";

export class GithubFlexiCard extends LitElement {

    private cardTitle: string | undefined | null;

    private repoElements: GithubRepo[] = [];

    private cardSize = 0;

    private sortOptions?: ISortOptions[];

    private order: number[] = [];

    private config: ICardConfig;

    private autoDiscover: boolean = false;

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
            repoElements: { type: Array },
            order: { type: Array },
        };
    }

    /**
     * Called whenever HS state is updated
     */
    set hass(hass: HomeAssistant) {

        // Auto-discover GitHub repos when none are configured
        if (this.autoDiscover) {
            const discoveredRepos = this.repoElements.map(e => e.repoName);

            Object.values(hass.devices).forEach(device => {
                if (device.identifiers?.some((id: [string, string]) => id.includes("github"))
                    && device.name
                    && !discoveredRepos.includes(device.name)) {
                    this.repoElements.push(this.getNewInitializedRepo(device.name));
                    discoveredRepos.push(device.name);
                }
            });
        }

        this.repoElements.forEach(repo => repo.hass = hass);

        if (this.sortOptions && this.sortOptions.length) {
            const attrNames = this.sortOptions.map(s => s.by);
            const values = this.repoElements.map(e =>
                attrNames.map(attr => Number(e.getRepoInfo(attr))));

            // default order matches the config
            const defaultOrder = this.repoElements.map((e, i) => i);
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

        const prevReposInConfig = this.config?.repos;

        this.config = cardConfig;

        this.cardSize = 0;

        if (this.cardTitle) {
            this.cardSize++;
        }

        const reposFromConfig = safeGetConfigArrayOfObjects(cardConfig.repos, "repo");

        this.autoDiscover = reposFromConfig.length === 0;

        if (prevReposInConfig != cardConfig.repos) {
            this.order = [];
            this.repoElements = reposFromConfig.map(repoConf => this.getNewInitializedRepo(repoConf));
        }
        else {
            this.repoElements.forEach((repo, index) => {
                const repoConf = getRepoConfig(reposFromConfig[index] || repo.repoName, cardConfig);
                repo.setConfig(repoConf);
            });
        }

        const sortOptions = safeGetArray(cardConfig.sort).map(s => safeGetConfigObject(s, "by"))
        this.sortOptions = sortOptions;
    }

    private getNewInitializedRepo(confEntry: string | IEntityConfig): GithubRepo {

        const repoConf = getRepoConfig(confEntry, this.config);

        this.order.push(this.order.length);

        const elem = document.createElement("github-repo") as GithubRepo;
        elem.setConfig(repoConf);
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
                ${this.order.map(i => html`<div>${this.repoElements[i]}</div>`)}
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
const getRepoConfig = (configEntry: IEntityConfig | string, cardConfig: ICardConfig): IEntityConfig => {

    const entityConfig = safeGetConfigObject(configEntry, "repo");

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
    entityConfig.debug = getConfigValue(entityConfig.debug, cardConfig.debug);

    return entityConfig;
}