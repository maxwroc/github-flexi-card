import { html, css, LitElement } from "../lit-element";
import { HomeAssistant } from "../ha-types";
import { defaultConfig } from "../default-config";
import { safeGetArray, safeGetConfigArrayOfObjects, safeGetConfigObject } from "../utils";
import styles from "./editor.css";

const AVAILABLE_ATTRIBUTES = [
    "stars",
    "issues",
    "pull_requests",
    "forks",
    "watchers",
];

export class GithubFlexiCardEditor extends LitElement {

    private config!: ICardConfig;

    private _hass!: HomeAssistant;

    set hass(hass: HomeAssistant) {
        this._hass = hass;
    }

    private getAvailableRepos(): string[] {
        if (!this._hass?.devices) return [];
        const repos: string[] = [];
        Object.values(this._hass.devices).forEach(device => {
            if (device.identifiers?.some((id: [string, string]) => id.includes("github")) && device.name) {
                repos.push(device.name);
            }
        });
        return repos.sort();
    }

    static get styles() {
        return css([styles]);
    }

    static get properties() {
        return {
            config: { type: Object },
            _hass: { type: Object },
        };
    }

    setConfig(config: ICardConfig) {
        this.config = {
            ...defaultConfig,
            ...config,
        };
    }

    private fireConfigChanged() {
        const event = new CustomEvent("config-changed", {
            detail: { config: this.config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    private onTitleChanged(e: Event) {
        const target = e.target as HTMLInputElement;
        this.config = { ...this.config, title: target.value || undefined };
        this.fireConfigChanged();
    }

    private onNameChanged(e: Event) {
        const target = e.target as HTMLInputElement;
        this.config = { ...this.config, name: target.value || undefined };
        this.fireConfigChanged();
    }

    private onSecondaryInfoChanged(e: Event) {
        const target = e.target as HTMLInputElement;
        this.config = { ...this.config, secondary_info: target.value || undefined };
        this.fireConfigChanged();
    }

    private onUrlToggled() {
        this.config = { ...this.config, url: !this.config.url };
        this.fireConfigChanged();
    }

    private onAttributeUrlsToggled() {
        this.config = { ...this.config, attribute_urls: !this.config.attribute_urls };
        this.fireConfigChanged();
    }

    private onCompactViewToggled() {
        this.config = { ...this.config, compact_view: !this.config.compact_view };
        this.fireConfigChanged();
    }

    private draggedItem: string | null = null;
    private dragGroup: string | null = null;

    private onAttributeToggled(attr: string) {
        const current = safeGetArray(this.config.attributes) as string[];
        const updated = current.includes(attr)
            ? current.filter(a => a !== attr)
            : [...current, attr];
        this.config = { ...this.config, attributes: updated };
        this.fireConfigChanged();
    }

    private onDragStart(e: DragEvent, item: string, group: string) {
        this.draggedItem = item;
        this.dragGroup = group;
        (e.target as HTMLElement).classList.add("dragging");
        e.dataTransfer!.effectAllowed = "move";
    }

    private onDragEnd(e: DragEvent) {
        (e.target as HTMLElement).classList.remove("dragging");
        this.draggedItem = null;
        this.dragGroup = null;
    }

    private onDragOver(e: DragEvent) {
        e.preventDefault();
        e.dataTransfer!.dropEffect = "move";
    }

    private onDrop(e: DragEvent, targetItem: string, group: string) {
        e.preventDefault();
        if (!this.draggedItem || this.draggedItem === targetItem || this.dragGroup !== group) return;

        if (group === "attributes") {
            const current = [...safeGetArray(this.config.attributes) as string[]];
            const fromIndex = current.indexOf(this.draggedItem);
            const toIndex = current.indexOf(targetItem);
            if (fromIndex === -1 || toIndex === -1) return;
            current.splice(fromIndex, 1);
            current.splice(toIndex, 0, this.draggedItem);
            this.config = { ...this.config, attributes: current };
        } else if (group === "sort") {
            const current = [...safeGetArray(this.config.sort).map(s => {
                const obj = safeGetConfigObject(s, "by");
                return (typeof s === "string" ? s : obj.by) as string;
            })];
            const fromIndex = current.indexOf(this.draggedItem);
            const toIndex = current.indexOf(targetItem);
            if (fromIndex === -1 || toIndex === -1) return;
            current.splice(fromIndex, 1);
            current.splice(toIndex, 0, this.draggedItem);
            this.config = { ...this.config, sort: current };
        }

        this.draggedItem = null;
        this.dragGroup = null;
        this.fireConfigChanged();
    }

    private onSortToggled(attr: string) {
        const current = safeGetArray(this.config.sort).map(s => {
            const obj = safeGetConfigObject(s, "by");
            return obj.by as string;
        }) as string[];
        const updated = current.includes(attr)
            ? current.filter(a => a !== attr)
            : [...current, attr];
        this.config = { ...this.config, sort: updated };
        this.fireConfigChanged();
    }

    private onRepoToggled(repo: string) {
        const repos = safeGetConfigArrayOfObjects(this.config.repos, "repo");
        const existing = repos.findIndex(r => r.repo === repo);
        if (existing !== -1) {
            repos.splice(existing, 1);
        } else {
            repos.push({ repo });
        }
        this.config = { ...this.config, repos };
        this.fireConfigChanged();
    }

    render() {
        if (!this.config) {
            return html``;
        }

        const selectedAttributes = safeGetArray(this.config.attributes) as string[];
        const selectedSort = safeGetArray(this.config.sort).map(s => {
            const obj = safeGetConfigObject(s, "by");
            return (typeof s === "string" ? s : obj.by) as string;
        });
        const repos = safeGetConfigArrayOfObjects(this.config.repos, "repo");
        const urlEnabled = !!this.config.url;
        const attrUrlsEnabled = !!this.config.attribute_urls;
        const compactEnabled = !!this.config.compact_view;

        return html`
        <div class="editor-container">
            <div class="form-row">
                <ha-textfield
                    label="Title"
                    .value=${this.config.title || ""}
                    @input=${this.onTitleChanged}
                ></ha-textfield>
            </div>

            <div class="form-row">
                <ha-textfield
                    label="Name template"
                    .value=${this.config.name || ""}
                    @input=${this.onNameChanged}
                ></ha-textfield>
                <span class="hint">Supports keywords like {path}, {full_name}</span>
            </div>

            <div class="form-row">
                <ha-textfield
                    label="Secondary info template"
                    .value=${this.config.secondary_info || ""}
                    @input=${this.onSecondaryInfoChanged}
                ></ha-textfield>
                <span class="hint">Supports keywords like {latest_release.attributes.tag|conditional()}</span>
            </div>

            <div class="switch-row">
                <span class="switch-label">Link to repository</span>
                <ha-switch
                    .checked=${urlEnabled}
                    @change=${this.onUrlToggled}
                ></ha-switch>
            </div>

            <div class="switch-row">
                <span class="switch-label">Link attributes to GitHub</span>
                <ha-switch
                    .checked=${attrUrlsEnabled}
                    @change=${this.onAttributeUrlsToggled}
                ></ha-switch>
            </div>

            <div class="switch-row">
                <span class="switch-label">Compact view</span>
                <ha-switch
                    .checked=${compactEnabled}
                    @change=${this.onCompactViewToggled}
                ></ha-switch>
            </div>

            <div class="form-row">
                <label>Visible attributes</label>
                <span class="hint">Click to toggle, drag to reorder</span>
                <div class="sort-chips">
                    ${selectedAttributes.map(attr => html`
                        <button
                            class="sort-chip active"
                            draggable="true"
                            @dragstart=${(e: DragEvent) => this.onDragStart(e, attr, "attributes")}
                            @dragend=${(e: DragEvent) => this.onDragEnd(e)}
                            @dragover=${(e: DragEvent) => this.onDragOver(e)}
                            @drop=${(e: DragEvent) => this.onDrop(e, attr, "attributes")}
                            @click=${() => this.onAttributeToggled(attr)}
                        >${attr.replace(/_/g, " ")}</button>
                    `)}
                    ${AVAILABLE_ATTRIBUTES.filter(a => !selectedAttributes.includes(a)).map(attr => html`
                        <button
                            class="sort-chip"
                            @click=${() => this.onAttributeToggled(attr)}
                        >${attr.replace(/_/g, " ")}</button>
                    `)}
                </div>
            </div>

            <div class="form-row">
                <label>Sort by</label>
                <span class="hint">Click to toggle, drag to reorder</span>
                <div class="sort-chips">
                    ${selectedSort.map(attr => html`
                        <button
                            class="sort-chip active"
                            draggable="true"
                            @dragstart=${(e: DragEvent) => this.onDragStart(e, attr, "sort")}
                            @dragend=${(e: DragEvent) => this.onDragEnd(e)}
                            @dragover=${(e: DragEvent) => this.onDragOver(e)}
                            @drop=${(e: DragEvent) => this.onDrop(e, attr, "sort")}
                            @click=${() => this.onSortToggled(attr)}
                        >${attr.replace(/_/g, " ")}</button>
                    `)}
                    ${AVAILABLE_ATTRIBUTES.filter(a => !selectedSort.includes(a)).map(attr => html`
                        <button
                            class="sort-chip"
                            @click=${() => this.onSortToggled(attr)}
                        >${attr.replace(/_/g, " ")}</button>
                    `)}
                </div>
            </div>

            <div class="form-row">
                <label>Repositories</label>
                <span class="hint">Select repositories to show (leave all unchecked for auto-discovery)</span>
                <div class="sort-chips">
                    ${this.getAvailableRepos().map(repo => html`
                        <button
                            class="sort-chip ${repos.some(r => r.repo === repo) ? "active" : ""}"
                            @click=${() => this.onRepoToggled(repo)}
                        >${repo}</button>
                    `)}
                </div>
            </div>

            <div class="version">v[VI]{version}[/VI]</div>
        </div>
        `;
    }
}
