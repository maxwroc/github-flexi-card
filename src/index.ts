import { GithubFlexiCard } from "./custom-elements/card";
import { GithubEntity } from "./custom-elements/entity";

// Registering cards
customElements.define("github-entity", GithubEntity);
customElements.define("github-flexi-card", GithubFlexiCard);

/*
  "sensor.battery_state_card" : {
    "entity_id": "sensor.battery_state_card",
    "state": "1d345503",
    "attributes": {
      "path": "maxwroc/battery-state-card",
      "name": "battery-state-card",
      "latest_commit_message": "Merge pull request #137 from maxwroc/dependabot/npm_and_yarn/tslib-2.0.2\n\nBump tslib from 2.0.1 to 2.0.2",
      "latest_commit_sha": "d6ab05b072a3c8471e051d64ce6de5170bd3d17c",
      "latest_release_url": "https://github.com/maxwroc/battery-state-card/releases/tag/v1.5.0",
      "latest_open_issue_url": "https://github.com/maxwroc/battery-state-card/pull/142",
      "open_issues": 2,
      "latest_open_pull_request_url": "https://github.com/maxwroc/battery-state-card/pull/142",
      "open_pull_requests": 1,
      "stargazers": 109,
      "forks": 5,
      "latest_release_tag": "v1.5.0",
      "clones": 68,
      "clones_unique": 14,
      "views": 1198,
      "views_unique": 556,
      "friendly_name": "battery-state-card",
      "icon": "mdi:github"
    }
  }

*/