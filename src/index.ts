import { GithubFlexiCard } from "./custom-elements/card";
import { GithubEntity } from "./custom-elements/entity";
import { printVersion } from "./utils";

// Registering cards
customElements.define("github-entity", GithubEntity);
customElements.define("github-flexi-card", GithubFlexiCard);

printVersion();

declare let window: HomeAssistantWindow;

window.customCards = window.customCards || [];
window.customCards.push({
    type: "github-flexi-card",
    name: "Github flexi card",
    preview: true,
    description: "Customizable card for github integration"
});