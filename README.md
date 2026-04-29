# Github Flexi Card
[![GitHub Release][releases-shield]][releases]
[![GitHub All Releases][downloads-total-shield]][releases]
[![Community Forum][forum-shield]][community-forum]
[![hacs_badge][hacs-shield]][hacs]

Home Assistant card displaying data from [Github integration][ha-gh-integration]

## Overview

The aim of this card is to show all the data provided by github integration. You can specify what kind of data is shown and where. Entity rows are matching the size of other standard entity rows from other native cards (e.g. height of the row, icon/text margins, font sizes, etc).

This code works as both: card and repo-row

Note: If you plan to use it only as repo row you can consider using the other simpler/smaller code written by benct: [github-entity-row][github-entity-row]

![image](https://user-images.githubusercontent.com/8268674/97019224-fad42300-1547-11eb-8153-46c401f50455.png)

## Breaking changes in v3.0.0

The card now uses **repository names** instead of entity IDs. This is a fundamental change to how the card is configured.

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
    secondary_info: 'Released {latest_release}'
```

If `repos` is omitted or empty, all GitHub repos added to Home Assistant will be auto-discovered.

## Configuration

### Default configuration

Please see the following file: [default-config.ts](https://github.com/maxwroc/github-flexi-card/blob/master/src/default-config.ts)

### Card
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| title | string |  | v0.1.0 | Card header/title text
| repos | list([Repo](#repo)) \| string |  | v3.0.0 | Collection of repos to display. You can provide simple list of repository name strings (e.g. `maxwroc/battery-state-card`). When empty all GitHub repos are auto-discovered.
| sort | list([SortOptions](#sort-options)) |  | v1.0.0 | Sort options collection (order matters). Every next sorting option is used for the next level sorting (if the values of the previous one are same)

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
| attributes | list([Attribute](#attribute)) |  | v0.1.0 | Attributes to display
| url | [KString](#keywordstring) \| bool |  | v0.2.0 | Url to open on click/tap. (when `true` is used the target url becomes repo homepage)
| attribute_urls | bool |  | v0.2.0 | When set to `true` turns on default urls for all the displayed attributes
| attribute_color | string | `var(--primary-color)` | v2.0.0 | Color applied to all attributes (icons or labels)
| icon | string | `"mdi:github"` | v0.2.0 | Override for repo icon
| icon_color | string |  | v2.0.0 | Icon color override
| compact_view | bool | `true` | v1.0.0 | When set to `false` big icons (and values) are displayed

### Attribute
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| name | string | **(required)** | v0.1.0 | Name of the attribute
| icon | string |  | v0.1.0 | Icon override (there are default icons for most of the available attributes)
| url | [KString](#keywordstring) \| bool |  | v0.2.0 | Url to open on click/tap. (there are default urls for most of the available attributes, so you can just use `true`)
| label | [KString](#keywordstring) |  | v0.5.0 | Label/text which will be shown instead of the icon
| color | string | `var(--primary-color)` | v2.0.0 | Icon / label color

### Attribute names

The GitHub integration creates multiple entities for every repo. The card resolves these entities automatically based on the repository name you provide.

![image](https://user-images.githubusercontent.com/8268674/152525143-0205c4c3-c79d-4038-b3a9-48753d2ebf0d.png)

I suggest to enable "Diagnostic" entities for your repo(s) on the [devices](https://my.home-assistant.io/redirect/devices/) page.

Available attribute names: `forks`, `issues`, `latest_commit`, `latest_issue`, `latest_pull_request`, `latest_release`, `pull_requests`, `merged_pull_requests`, `stars`, `watchers`, `discussions`, `latest_discussion`, `latest_tag`.

Special repo attributes:

| Name | Description |
|:-----|:-----|
| path | Repository path e.g. `maxwroc/github-flexi-card` |
| owner | First part of repository path e.g. `maxwroc` for the `maxwroc/github-flexi-card` repo
| repo | Second part of repository path e.g. `github-flexi-card` for the `maxwroc/github-flexi-card` repo

### Sort options

| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| by | string | **(required)** | v1.0.0 | Name of the attribute
| ascending | bool | `false` | v1.0.0 | Whether to sort ascending or descending


### KeywordString

KeywordString is a string which can contain special keywords. Keywords are the repo attribute names surrounded by curly brackets. Keywords in the string will be replaced by attribute values.

E.g. `"Card version {latest_release.attributes.tag}"` becomes `"Card version v1.5.0"`

#### Converting keyword value

Keywords support simple functions to convert the values

| Func | Example | Description |
|:-----|:-----|:-----|
| `replace([old_string],[new_string])` | `{latest_release\|replace(Git,Proj)}` | Simple replace. E.g. if name contains "Git" string then it will be replaced by "Proj"
| `conditional()` | `{latest_release.attributes.tag\|conditional()}` | If the value doesn't exist nothing is rendered (the default behaviour is to render the keyword)
| `round([number])` | `{state\|round(2)}` | Rounds the value to number of fractional digits. Not very useful for this card I think (the KString processing code was copied from the other card so I just left this func)

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

Card-level repo properties are useful when you want to have same settings for all of the repos.

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

Install via HACS. Look for the card in Frontend plugins collection.

If you have a YAML mode remember to add resource entry for the js bundle in ui-lovelace.yaml:

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

If the card is not rendering as expected or you want to inspect the data it receives from Home Assistant, you can enable the `debug` option.

### Using the debug config

Add `debug` to your card or repo configuration. When enabled, the normal repo view is replaced with a diagnostic panel showing the resolved config, entity map, and all entity states.

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

Don't "buy me a coffee", just star it on github! It will be enough to let me know that you like it and definitely will give me motivation boost to continue working on it and other cards.

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
