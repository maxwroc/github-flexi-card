import { GithubFlexiCard } from "./custom-elements/card";
import { GithubEntity } from "./custom-elements/entity";
import { printVersion } from "./utils";

// Registering cards
customElements.define("github-entity", GithubEntity);
customElements.define("github-flexi-card", GithubFlexiCard);

printVersion();