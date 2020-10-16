# Github Flexi Card
Home Assistant card displaying data from [Github integration](https://www.home-assistant.io/integrations/github/)

## Overview

The aim of this card is to show all the data provided by github integration. You can specify what kind of data is shown and where. Entity rows are matching the size of other standard entity rows from other native cards (e.g. height of the row, icon/text margins, font sizes, etc).

![image](https://user-images.githubusercontent.com/8268674/95763370-d904b180-0ca6-11eb-9951-56c8200ee025.png)

This component can be used as entity as well

![image](https://user-images.githubusercontent.com/8268674/96303544-7be46500-0ff2-11eb-9a86-16af9c52f1d0.png)

## Configuration

### Card
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| title | String |  | v0.1.0 | Card header/title text
| entities | [Entity](#entity)[] \| String | **(required)** | v0.1.0 | Collection of entities to display. You can provide simple list of entity_id strings.

[+ Entity Properties](#Entity-Properties) - applied to all entities

### Entity
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| entity | String | **(required)** | v0.1.0 | Entity ID e.g. `sensor.my_github_project`

[+ Entity Properties](#Entity-Properties)

### Entity Properties
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| name | [KString](#keywordstring) |  | v0.1.0 | Name override
| secondary_info | [KString](#keywordstring) |  | v0.1.0 | String to display underneath the entity name
| attributes | [Attribute](#attribute)[] |  | v0.1.0 | Attributes to display
| url | [KString](#keywordstring) \| Boolean |  | v0.2.0 | Url to open on click/tap. (when `true` is used the target url becomes repo homepage)
| attribute_urls | Boolean |  | v0.2.0 | When set to `true` turns on default urls for all the displayed attributes
| icon | String | `"mdi:github"` | v0.2.0 | Override for entity icon

### Attribute
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| name | String | **(required)** | v0.1.0 | Name of the attribute
| icon | String |  | v0.1.0 | Icon override (there are default icons for most of the available attributes)
| url | [KString](#keywordstring) \| Boolean |  | v0.2.0 | Url to open on click/tap. (there are default urls for most of the available attributes, so you can just use `true`)

### KeywordString

KeywordString is a string which can contain special keywords. Keywords are the attribute names surrounded by curly brackets. Keywords in the string will be replaced by attribute values.

E.g. `"Card version {latest_release_tag}"` becomes `"Card version v1.5.0"`

![image](https://user-images.githubusercontent.com/8268674/95771623-4ddde880-0cb3-11eb-9265-57876a08bd6e.png)

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
      - name: views
      - name: stargazers
      - name: forks
  - entity: sensor.urleditorpro
    name: 'Url Editor Pro (v{latest_release_tag})'
    secondary_info: 'Clones: {clones}'
    attributes:
      - name: views
      - name: stargazers
      - name: open_issues
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
      - name: views
      - name: stargazers
      - name: open_issues
      - name: clones
      - name: forks
      - name: open_pull_requests
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
  - name: views
  - name: stargazers
  - name: open_issues
  - name: clones
  - name: forks
  - name: open_pull_requests
entities:
  - sensor.battery_state_card
  - sensor.hideseek_mod
  - sensor.urleditorpro
```

## How to install?

Install HACS and add this repo as custom repository (lovelace plugins). Click on "Install".

If you have a YAML mode remember to add resource entry for the js bundle in ui-lovelace.yaml:

```yaml
resources:
  - url: /hacsfiles/github-flexi-card/github-flexi-card.js
    type: module
```