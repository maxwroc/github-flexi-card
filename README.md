# Github Flexi Card
[![GitHub Release][releases-shield]][releases]
[![GitHub All Releases][downloads-total-shield]][releases]
[![Community Forum][forum-shield]][community-forum]
<!--[![hacs_badge][hacs-shield]][hacs]-->

Home Assistant card displaying data from [Github integration][ha-gh-integration]

## Overview

The aim of this card is to show all the data provided by github integration. You can specify what kind of data is shown and where. Entity rows are matching the size of other standard entity rows from other native cards (e.g. height of the row, icon/text margins, font sizes, etc).

This code works as both: card and enrity-row

Note: If you plan to use it only as entity row you can consider using the other simpler/smaller code written by benct: [github-entity-row][github-entity-row]

![image](https://user-images.githubusercontent.com/8268674/97019224-fad42300-1547-11eb-8153-46c401f50455.png)

## Configuration

### Card
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| title | string |  | v0.1.0 | Card header/title text
| entities | list([Entity](#entity)) \| string | **(required)** | v0.1.0 | Collection of entities to display. You can provide simple list of entity_id strings.
| sort | list([SortOptions](#sort-options)) |  | v1.0.0 | Sort options collection (order matters). Every next sorting option is used fot the next level sorting (if the values of the previous one are same)

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
| icon | string | `"mdi:github"` | v0.2.0 | Override for entity icon
| compact_view | bool | `true` | v1.0.0 | When set to `false` big icons (and values) are displayed

### Attribute
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| name | string | **(required)** | v0.1.0 | Name of the attribute
| icon | string |  | v0.1.0 | Icon override (there are default icons for most of the available attributes)
| url | [KString](#keywordstring) \| bool |  | v0.2.0 | Url to open on click/tap. (there are default urls for most of the available attributes, so you can just use `true`)
| label | [KString](#keywordstring) |  | v0.5.0 | Label/text which will be shown instead of the icon

### Sort options

| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| by | string | **(required)** | v1.0.0 | Name of the attribute
| ascending | bool | `false` | v1.0.0 | Whether to sort ascending or descending


### KeywordString

KeywordString is a string which can contain special keywords. Keywords are the attribute names surrounded by curly brackets. Keywords in the string will be replaced by attribute values.

E.g. `"Card version {latest_release_tag}"` becomes `"Card version v1.5.0"`

![image](https://user-images.githubusercontent.com/8268674/95771623-4ddde880-0cb3-11eb-9265-57876a08bd6e.png)

#### Converting keyword value

You can do simple replace operation on the value e.g.: `"{name:Github=Project}"`. It will replace `"Github"` string in the `name` value with `"Project"`, so if your name attribute is `"Github github-flexi-card"` then the final result will be `"Project github-flexi-card"`.

Note: It is very simple replace machanism, it is case sensitive, replaces only first match and it doesn't have any escape chars so you cannot use characters like `=` or `:` in the search word nor target word.

## Configuration examples

### Card

```yaml
type: 'custom:github-flexi-card'
title: Github projects
entities:
  - entity: sensor.battery_state_card
    secondary_info: 'Released {latest_release_tag}'
    url: "{latest_release_url}" # url taken from attribute
    attributes:
      - name: views
        url: true # default url to graphs/traffic
      - name: stargazers
      - name: open_issues
      - name: clones
        url: "https://my.custom.url/path"
      - name: forks
      - name: open_pull_requests
        url: "{latest_open_pull_request_url}" # url taken from attribute
  - entity: sensor.hideseek_mod
    url: true # default url - repo homepage
    attributes:
      - views
      - stargazers
      - forks
  - entity: sensor.urleditorpro
    name: 'Url Editor Pro (v{latest_release_tag})'
    secondary_info: 'Clones: {clones}'
    attributes:
      - views
      - stargazers
      - open_issues
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
      - views
      - stargazers
      - open_issues
      - clones
      - forks
      - open_pull_requests
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
  - stargazers
  - open_issues
  - clones
  - forks
  - open_pull_requests
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
  - name: stargazers
    label: Stars
  - name: open_issues
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
  - views
  - stargazers
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
title: Sort by starts and views (asc)
secondary_info: '{latest_release_tag}'
url: true
attribute_urls: true
attributes:
  - views_unique
  - stargazers
  - open_issues
  - open_pull_requests
sort:
  - by: stargazers
  - by: views_unique
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

Install HACS and add this repo as custom repository (lovelace plugins). Click on "Install".

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
