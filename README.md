# Github Flexi Card
Home Assistant card displaying data from [Github integration](https://www.home-assistant.io/integrations/github/)

## Overview

The aim of this card is to show all the data provided by github integration. You can specify what kind of data is shown and where. Entity rows are matching the size of other standard entity rows from other native cards (e.g. height of the row, icon/text margins, font sizes, etc).

![image](https://user-images.githubusercontent.com/8268674/95763370-d904b180-0ca6-11eb-9951-56c8200ee025.png)


## Configuration

### Card
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| title | String |  | v0.1.0 | Card header/title text
| entities | [Entity](#entity)[] | **(required)** | v0.1.0 | Collection of entities to display


### Entity
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| entity_id | String | **(required)** | v0.1.0 | Entity ID e.g. `sensor.my_github_project`
| name | [KeywordString](#keywordstring) |  | v0.1.0 | Name override
| secondary_info | [KeywordString](#keywordstring) |  | v0.1.0 | String to display underneath the entity name
| attributes | [Attribute](#attribute)[] |  | v0.1.0 | Attributes to display

### Attribute
| Name | Type | Default | Since | Description |
|:-----|:-----|:-----|:-----|:-----|
| name | String | **(required)** | v0.1.0 | Name of the attribute
| icon | String |  | v0.1.0 | Icon override (there are default icons for most of the available attributes)

### KeywordString

KeywordString is a string which can contain special keywords. Keywords are the attribute names surrounded by curly brackets. Keywords in the string will be replaced by attribute values.

E.g. `"Card version {latest_release_tag}"` becomes `"Card version v1.5.0"`

![image](https://user-images.githubusercontent.com/8268674/95771623-4ddde880-0cb3-11eb-9265-57876a08bd6e.png)

### Example configuration

```yaml
type: 'custom:github-flexi-card'
title: Github projects
entities:
  - entity_id: sensor.battery_state_card
    secondary_info: 'Released {latest_release_tag}'
    attributes:
      - name: views
      - name: stargazers
      - name: open_issues
      - name: clones
      - name: forks
      - name: open_pull_requests
  - entity_id: sensor.hideseek_mod
    attributes:
      - name: views
      - name: stargazers
      - name: forks
  - entity_id: sensor.urleditorpro
    name: 'Url Editor Pro (v{latest_release_tag})'
    secondary_info: 'Clones: {clones}'
    attributes:
      - name: views
      - name: stargazers
      - name: open_issues
```

### How to install?

Install HACS and add this repo as custom repository (lovelace plugins). Click on "Install".

If you have a YAML mode remember to add resource entry for the js bundle in ui-lovelace.yaml:

```yaml
resources:
  - url: /hacsfiles/github-flexi-card/github-flexi-card.js
    type: module
```