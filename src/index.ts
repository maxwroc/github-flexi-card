import { GithubFlexiCard } from "./custom-elements/card";
import { GithubFlexiCardEditor } from "./custom-elements/editor";
import { GithubRepo } from "./custom-elements/repo";
import { printVersion } from "./utils";

// Registering cards
customElements.define("github-repo", GithubRepo);
customElements.define("github-flexi-card", GithubFlexiCard);
customElements.define("github-flexi-card-editor", GithubFlexiCardEditor);

printVersion();

declare let window: HomeAssistantWindow;

window.customCards = window.customCards || [];
window.customCards.push({
    type: "github-flexi-card",
    name: "Github flexi card",
    preview: true,
    description: "Customizable card for github integration"
});