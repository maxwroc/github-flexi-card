# Github Flexi Card
[![GitHub Release][releases-shield]][releases]
[![GitHub All Releases][downloads-total-shield]][releases]
[![Community Forum][forum-shield]][community-forum]
[![hacs_badge][hacs-shield]][hacs]

Home Assistant card displaying data from [Github integration][ha-gh-integration]

## Overview

The aim of this card is to show all the data provided by github integration. You can specify what kind of data is shown and where. Entity rows are matching the size of other standard entity rows from other native cards (e.g. height of the row, icon/text margins, font sizes, etc).

This code works as both: card and enrity-row

Note: If you plan to use it only as entity row you can consider using the other simpler/smaller code written by benct: [github-entity-row][github-entity-row]

![image](https://user-images.githubusercontent.com/8268674/97019224-fad42300-1547-11eb-8153-46c401f50455.png)

## Configuration

Note: Please **do not change** the original entity IDs otherwise card won't be able to find related entities.

### Default configuration

Please see the following file: [default-config.ts](https://github.com/maxwroc/github-flexi-card/blob/master/src/default-config.ts)

### Card
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| title | string |  | v0.1.0 | Card header/title text
| entities | list([Entity](#entity)) \| string |  | v0.1.0 | Collection of entities to display. You can provide simple list of entity_id strings.
| sort | list([SortOptions](#sort-options)) |  | v1.0.0 | Sort options collection (order matters). Every next sorting option is used fot the next level sorting (if the values of the previous one are same)
| auto | string \| `false` | `"_latest_release"` | v2.0.0 | Whether to add entities automatically based on the entity ID suffix. You can specify here a different suffix which should be used to find entities

[+ Entity Properties](#Entity-Properties) - applied to all entities

### Entity
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| entity | string | **(required)** | v0.1.0 | Entity ID e.g. `sensor.my_github_project`

[+ Entity Properties](#Entity-Properties)

### Entity Properties
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| name | [KString](#keywordstring) | `friendly_name` | v0.1.0 | Name override
| secondary_info | [KString](#keywordstring) |  | v0.1.0 | String to display underneath the entity name
| attributes | list([Attribute](#attribute)) |  | v0.1.0 | Attributes to display
| url | [KString](#keywordstring) \| bool |  | v0.2.0 | Url to open on click/tap. (when `true` is used the target url becomes repo homepage)
| attribute_urls | bool |  | v0.2.0 | When set to `true` turns on default urls for all the displayed attributes
| attribute_color | string | `var(--primary-color)` | v2.0.0 | Color applied to all attributes (icons or labels)
| icon | string | `"mdi:github"` | v0.2.0 | Override for entity icon
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

When you enable Github Integration it creates couple entities for every repo. Each entity for single repo has a common prefix e.g. "sensor.maxwroc_github_flexi_card_". The last part of the entity name is (what I call here) repo attribute e.g. for "sensor.maxwroc_github_flexi_card_pull_requests" entity the attribute name is "pull_requests".

![image](https://user-images.githubusercontent.com/8268674/152525143-0205c4c3-c79d-4038-b3a9-48753d2ebf0d.png)

I suggest to enable "Diagnostic" entities for your repo(s) on the [devices](https://my.home-assistant.io/redirect/devices/) page.

It is possible to access **entity** attributes by adding an underscore with the name of the attribute. E.g. if you want to get the `tag` attribute from `*_latest_release` entity you can use `latest_release_tag` as the attribute name in the configuration.

![image](https://user-images.githubusercontent.com/8268674/152525501-efea7c65-0ad6-473a-817c-00c91dab4c46.png)

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

E.g. `"Card version {latest_release_tag}"` becomes `"Card version v1.5.0"`

#### Converting keyword value

Keywords support simple functions to convert the values

| Func | Example | Description |
|:-----|:-----|:-----|
| replace(\[old_string\]=\[new_string\]) | `{latest_release\|replace(Git=Proj)}` | Simple replace. E.g. if name contains "Git" string then it will be replaced by "Proj"
| conditional() | `{latest_release_tag\|conditional()}` | If the value doesn't exist nothing is rendered (the default behaviour is to render the keyword)
| round(\[number\]) | `{state\|round(2)}` | Rounds the value to number of fractional digits. Not very useful for this card I think (the KString processing code was copied from the other card so I just left this func)

## Configuration examples

### Card

```yaml
type: 'custom:github-flexi-card'
title: Github projects
entities:
  - entity: sensor.maxwroc_battery_state_card_latest_release
    secondary_info: 'Released {latest_release_tag}'
    url: "{latest_release_url}" # url taken from attribute
    attributes:
      - name: stars
        url: true # default url to /stargazers
      - name: issues
        url: "https://my.custom.url/path"
      - name: forks
      - name: pull_requests
        url: "{latest_pull_request_url}" # url taken from attribute
  - entity: sensor.hideseek_mod
    url: true # default url - repo homepage
    attributes:
      - views
      - stars
      - forks
  - entity: sensor.urleditorpro
    name: 'Url Editor Pro (v{latest_release_tag})'
    secondary_info: '{latest_pull_request}'
    attributes:
      - views
      - stars
      - issues
```

### Entity

Note: different type has to be used `custom:github-entity`

![image](https://user-images.githubusercontent.com/8268674/96303544-7be46500-0ff2-11eb-9a86-16af9c52f1d0.png)

```yaml
type: entities
title: Displayed as entity
show_header_toggle: false
entities:
  - sensor.home_assistant_v2_db
  - type: 'custom:github-entity'
    entity: sensor.battery_state_card
    secondary_info: 'Released {latest_release_tag}'
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

### Card-level entity properties

Card-level entity properties are useful when you want to have same settings for all of the entities.

![image](https://user-images.githubusercontent.com/8268674/96266114-30b05f00-0fbe-11eb-9d10-f9b9e5dfc1cf.png)

```yaml
type: 'custom:github-flexi-card'
title: Card-level entity properties
secondary_info: 'Released {latest_release_tag}'
url: true
attribute_urls: true
attributes:
  - views
  - stars
  - issues
  - watchers
  - forks
  - pull_requests
entities:
  - sensor.battery_state_card
  - sensor.hideseek_mod
  - sensor.urleditorpro
```

### Labels instead of icons

![image](https://user-images.githubusercontent.com/8268674/96354074-37c49380-10ca-11eb-9151-829e5c37f877.png)

```yaml
type: 'custom:github-flexi-card'
title: Labels instead of icons
url: true
attribute_urls: true
attributes:
  - name: views
    label: Views
  - name: stars
    label: Stars
  - name: issues
    label: Issues
entities:
  - sensor.battery_state_card
  - sensor.hideseek_mod
  - sensor.urleditorpro
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
entities:
  - sensor.battery_state_card
  - entity: sensor.hideseek_mod
    compact_view: false
  - sensor.urleditorpro
```

### Sorting

![image](https://user-images.githubusercontent.com/8268674/96928429-72ef0a00-14b0-11eb-95dd-4f1c76e217ec.png)

```yaml
type: 'custom:github-flexi-card'
title: Sort by starts and forks (asc)
secondary_info: '{latest_release_tag}'
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
entities:
  - sensor.battery_state_card
  - sensor.hideseek_mod
  - sensor.github_flexi_card
  - sensor.urleditorpro
  - entity: sensor.home_assistant_config
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

## Development

Card created based on [lovelace-card-boilerplate](https://github.com/maxwroc/lovelace-card-boilerplate)

```
npm install
npm run build
```

For new features create your branch based on vNext and for fixes based on master.

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
