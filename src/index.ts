import { LitElement, html } from "./lit-element";
import { HomeAssistant } from "./ha-types";
import { ICardConfig } from "./types";
import styles from "./styles";

class MyCustomCard extends LitElement {

    private header: string = "Card header";

    /**
     * CSS for the card
     */
    static get styles() {
        return styles;
    }

    set hass(hass: HomeAssistant) {
    }

    setConfig(config: ICardConfig) {
        this.requestUpdate();
    }

    render() {
        return html`
        <ha-card>
            <div class="card-header">
                <div class="truncate">
                    ${this.header}
                </div>
            </div>
            <div class="card-content">
                <div class="entity-row">
                    <div class="icon">
                        <ha-icon
                            style="color: yellow"
                            icon="mdi:lightbulb"
                        ></ha-icon>
                    </div>
                    <div class="name truncate">
                        Entity name
                        <div class="secondary">Secondary info</div>
                    </div>
                    <div class="state">
                        State
                    </div>
                <div>
            </div>
        </ha-card>
        `;
    }
}

// Registering card
customElements.define("my-custom-card", MyCustomCard);

console.log("my-custom-card");