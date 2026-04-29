# Github Flexi Card
[![GitHub Release][releases-shield]][releases]
[![GitHub All Releases][downloads-total-shield]][releases]
[![Community Forum][forum-shield]][community-forum]
[![hacs_badge][hacs-shield]][hacs]

Home Assistant card displaying data from [Github integration][ha-gh-integration]

## Overview

This card displays all the data provided by the GitHub integration. You can choose what data is shown and where it appears. Entity rows match the dimensions of standard rows from native cards (e.g. row height, icon/text margins, font sizes, etc.).

It works as both a standalone card (`customn:github-flexi-card`) and a entity row (`custom:github-repo`).

Note: If you only need a entity row, consider the simpler/lighter alternative by benct: [github-entity-row][github-entity-row]

![image](https://user-images.githubusercontent.com/8268674/97019224-fad42300-1547-11eb-8153-46c401f50455.png)

## Breaking changes in v3.0.0

The card now uses **repository names** instead of entity IDs — a fundamental change to how the card is configured.

### What changed

| Removed | Replacement | Notes |
|:--------|:------------|:------|
| `entities` (card config) | `repos` | List of repository names (e.g. `maxwroc/battery-state-card`) instead of entity IDs |
| `entity` (repo config) | `repo` | Repository name instead of entity ID |
| `auto` (card config) | *(removed)* | Auto-discovery now happens automatically when `repos` is empty |
| `custom:github-entity` | `custom:github-repo` | Custom element type renamed |
| Attribute sub-properties (e.g. `latest_release_tag`) | Direct entity keys (e.g. `latest_release`) | Entity attributes are no longer accessed via underscore notation |

### Migration guide

**Before (v2.x):**
```yaml
type: 'custom:github-flexi-card'
title: My repos
entities:
  - sensor.maxwroc_battery_state_card_latest_release
  - entity: sensor.hideseek_mod_latest_release
    secondary_info: 'Released {latest_release_tag}'
```

**After (v3.0.0):**
```yaml
type: 'custom:github-flexi-card'
title: My repos
repos:
  - maxwroc/battery-state-card
  - repo: maxwroc/hideseek-mod
    secondary_info: 'Released {latest_release.attributes.tag}'
```

If `repos` is omitted or empty, all GitHub repos added to Home Assistant will be auto-discovered.

## Configuration

### Default configuration

Please see the following file: [default-config.ts](https://github.com/maxwroc/github-flexi-card/blob/master/src/default-config.ts)

### Card
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| title | string |  | v0.1.0 | Card header/title text
| repos | list([Repo](#repo)) \| string |  | v3.0.0 | Repos to display. Accepts a list of repository name strings (e.g. `maxwroc/battery-state-card`). When empty, all GitHub repos are auto-discovered.
| sort | list([SortOptions](#sort-options)) |  | v1.0.0 | Sort options (order matters). Each subsequent option acts as a tiebreaker when values from the previous one are equal.

[+ Repo Properties](#Repo-Properties) - applied to all repos

### Repo
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| repo | string | **(required)** | v3.0.0 | Repository name e.g. `maxwroc/battery-state-card`

[+ Repo Properties](#Repo-Properties)

### Repo Properties
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| name | [KString](#keywordstring) | `"{path}"` | v0.1.0 | Name override
| secondary_info | [KString](#keywordstring) |  | v0.1.0 | String to display underneath the repo name
| attributes | list([Attribute](#attribute)) |  | v0.1.0 | Repository attributes/entities to display
| url | [KString](#keywordstring) \| bool |  | v0.2.0 | URL to open on click/tap. When set to `true`, links to the repo homepage.
| attribute_urls | bool |  | v0.2.0 | When `true`, enables default URLs for all displayed attributes
| attribute_color | string | `var(--primary-color)` | v2.0.0 | Color applied to all attributes (icons or labels)
| icon | string | `"mdi:github"` | v0.2.0 | Override for repo icon
| icon_color | string |  | v2.0.0 | Icon color override
| compact_view | bool | `true` | v1.0.0 | When `false`, displays larger icons and values

### Attribute
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| name | string | **(required)** | v0.1.0 | Name of the attribute (please check the list below)
| icon | string |  | v0.1.0 | Icon override (there are default icons for most of the available attributes)
| url | [KString](#keywordstring) \| bool |  | v0.2.0 | URL to open on click/tap. Most attributes have default URLs, so you can simply use `true`.
| label | [KString](#keywordstring) |  | v0.5.0 | Label/text which will be shown instead of the icon
| color | string | `var(--primary-color)` | v2.0.0 | Icon / label color

### Attribute names

The GitHub integration creates multiple entities per repo. Since entity IDs can be translated, the card cannot rely on them. Instead, it automatically detects entities based on their `translation_key` value, which is language-agnostic. Because of this, there is a fixed list of supported repository attributes/entities you can use.

Available attribute names: `forks`, `issues`, `latest_commit`, `latest_issue`, `latest_pull_request`, `latest_release`, `pull_requests`, `merged_pull_requests`, `stars`, `watchers`, `discussions`, `latest_discussion`, `latest_tag`.

![image](https://user-images.githubusercontent.com/8268674/152525143-0205c4c3-c79d-4038-b3a9-48753d2ebf0d.png)

I recommend enabling all "Diagnostic" entities for your repo(s) on the [devices](https://my.home-assistant.io/redirect/devices/) page.

### Sort options

| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| by | string | **(required)** | v1.0.0 | Name of the attribute
| ascending | bool | `false` | v1.0.0 | Whether to sort ascending or descending


### KeywordString

A KeywordString is a string that can contain special keywords — repo attribute names enclosed in curly brackets. These keywords are replaced with their corresponding attribute values at render time.

E.g. `"Card version {latest_release.attributes.tag}"` becomes `"Card version v1.5.0"`

Special repo attributes available in KeywordStrings

| Name | Description |
|:-----|:-----|
| path | Repository path e.g. `maxwroc/github-flexi-card` |
| owner | First part of repository path e.g. `maxwroc` for the `maxwroc/github-flexi-card` repo
| repo | Second part of repository path e.g. `github-flexi-card` for the `maxwroc/github-flexi-card` repo

#### Converting keyword value

Keywords support simple functions to convert the values

| Func | Example | Description |
|:-----|:-----|:-----|
| `replace([old_string],[new_string])` | `{latest_release\|replace(Git,Proj)}` | Replaces occurrences of `old_string` with `new_string` in the value
| `conditional()` | `{latest_release.attributes.tag\|conditional()}` | Renders nothing if the value doesn't exist (by default, the raw keyword is shown)
| `round([number])` | `{state\|round(2)}` | Rounds the value to the specified number of decimal places

## Configuration examples

### Card

```yaml
type: 'custom:github-flexi-card'
title: Github projects
repos:
  - repo: maxwroc/battery-state-card
    secondary_info: 'Released {latest_release}'
    url: true
    attributes:
      - name: stars
        url: true # default url to /stargazers
      - name: issues
        url: "https://my.custom.url/path"
      - name: forks
      - name: pull_requests
  - repo: maxwroc/hideseek-mod
    url: true # default url - repo homepage
    attributes:
      - stars
      - forks
  - repo: nicolo-ribaudo/tc39-proposal-url-editor-pro
    name: 'Url Editor Pro (v{latest_release})'
    secondary_info: '{latest_pull_request}'
    attributes:
      - stars
      - issues
```

### Repo

Note: different type has to be used `custom:github-repo`

![image](https://user-images.githubusercontent.com/8268674/96303544-7be46500-0ff2-11eb-9a86-16af9c52f1d0.png)

```yaml
type: entities
title: Displayed as entity
show_header_toggle: false
entities:
  - sensor.home_assistant_v2_db
  - type: 'custom:github-repo'
    repo: maxwroc/battery-state-card
    secondary_info: 'Released {latest_release.attributes.tag}'
    url: true
    attribute_urls: true
    attributes:
      - stars
      - issues
      - forks
      - pull_requests
      - watchers
  - sensor.hassio_online
  - sensor.last_boot
  - sensor.processor_use
```

### Card-level repo properties

Card-level repo properties let you apply the same settings to all repos at once.

![image](https://user-images.githubusercontent.com/8268674/96266114-30b05f00-0fbe-11eb-9d10-f9b9e5dfc1cf.png)

```yaml
type: 'custom:github-flexi-card'
title: Card-level repo properties
secondary_info: 'Released {latest_release.attributes.tag}'
url: true
attribute_urls: true
attributes:
  - stars
  - issues
  - watchers
  - forks
  - pull_requests
repos:
  - maxwroc/battery-state-card
  - maxwroc/hideseek-mod
  - nicolo-ribaudo/tc39-proposal-url-editor-pro
```

### Labels instead of icons

![image](https://user-images.githubusercontent.com/8268674/96354074-37c49380-10ca-11eb-9151-829e5c37f877.png)

```yaml
type: 'custom:github-flexi-card'
title: Labels instead of icons
url: true
attribute_urls: true
attributes:
  - name: stars
    label: Stars
  - name: issues
    label: Issues
repos:
  - maxwroc/battery-state-card
  - maxwroc/hideseek-mod
  - nicolo-ribaudo/tc39-proposal-url-editor-pro
```

### Compact view (disabling)

![image](https://user-images.githubusercontent.com/8268674/96794344-eda71f00-13f5-11eb-85f2-f60caad2fa63.png)

```yaml
type: 'custom:github-flexi-card'
title: Big icons
url: true
attribute_urls: true
attributes:
  - watchers
  - stars
repos:
  - maxwroc/battery-state-card
  - repo: maxwroc/hideseek-mod
    compact_view: false
  - nicolo-ribaudo/tc39-proposal-url-editor-pro
```

### Sorting

![image](https://user-images.githubusercontent.com/8268674/96928429-72ef0a00-14b0-11eb-95dd-4f1c76e217ec.png)

```yaml
type: 'custom:github-flexi-card'
title: Sort by stars and forks (asc)
secondary_info: '{latest_release}'
url: true
attribute_urls: true
attributes:
  - watchers
  - stars
  - issues
  - forks
sort:
  - by: stars
  - by: forks
    ascending: true
repos:
  - maxwroc/battery-state-card
  - maxwroc/hideseek-mod
  - maxwroc/github-flexi-card
  - nicolo-ribaudo/tc39-proposal-url-editor-pro
  - repo: maxwroc/homeassistant
    secondary_info: null
```

## How to install?

Install via HACS — look for the card in the Frontend plugins collection.

If you use YAML mode, remember to add a resource entry for the JS bundle in `ui-lovelace.yaml`:

```yaml
resources:
  - url: /hacsfiles/github-flexi-card/github-flexi-card.js
    type: module
```

## Automation

If you want to receive notifications whenever something changes with the repo you can use my automation as an example:
https://github.com/maxwroc/homeassistant/blob/master/configuration/packages/github.yaml

## Development

Card created based on [lovelace-card-boilerplate](https://github.com/maxwroc/lovelace-card-boilerplate)

```
npm install
npm run build
```

For new features create your branch based on vNext and for fixes based on master.

## Troubleshooting

If the card isn't rendering as expected or you want to inspect the data it receives from Home Assistant, enable the `debug` option.

### Using the debug config

Add `debug` to your card or repo configuration. When enabled, the repo view is replaced with a diagnostic panel showing the resolved config, entity map, and all entity states.

| Value | Effect |
|:------|:-------|
| `true` | Shows debug output for **all** repos |
| `"owner/repo-name"` | Shows debug output only for the **matching** repo |

The debug panel includes a **Show / hide** toggle and a **Copy to clipboard** button so you can easily share the data when reporting issues.

#### Card-level (all repos)

```yaml
type: 'custom:github-flexi-card'
debug: true
repos:
  - maxwroc/battery-state-card
  - maxwroc/hideseek-mod
```

#### Single repo

```yaml
type: 'custom:github-flexi-card'
repos:
  - repo: maxwroc/battery-state-card
    debug: true
  - maxwroc/hideseek-mod
```

#### Specific repo by name (card-level)

```yaml
type: 'custom:github-flexi-card'
debug: "maxwroc/battery-state-card"
repos:
  - maxwroc/battery-state-card
  - maxwroc/hideseek-mod
```

## Do you like the card?

Don't "buy me a coffee" — just star it on GitHub! That's enough to let me know you like it and will definitely motivate me to keep working on it and other cards.

## My other HA related repos
[battery-state-card](https://github.com/maxwroc/battery-state-card) | [homeassistant-config](https://github.com/maxwroc/homeassistant) | [lovelace-card-boilerplate](https://github.com/maxwroc/lovelace-card-boilerplate)

[releases]: https://github.com/maxwroc/github-flexi-card/releases
[releases-shield]: https://img.shields.io/github/release/maxwroc/github-flexi-card.svg?style=popout
[downloads-total-shield]: https://img.shields.io/github/downloads/maxwroc/github-flexi-card/total
[community-forum]: https://community.home-assistant.io/t/lovelace-github-flexi-card/238635
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=popout
[hacs-shield]: https://img.shields.io/badge/HACS-Default-orange.svg
[hacs]: https://hacs.xyz/docs/default_repositories
[ha-gh-integration]: https://www.home-assistant.io/integrations/github/
[github-entity-row]: https://github.com/benct/lovelace-github-entity-row
