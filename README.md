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
| entity | String | **(required)** | v0.1.0 | Entity ID e.g. `sensor.my_github_project`
| name | [KString](#keywordstring) |  | v0.1.0 | Name override
| secondary_info | [KString](#keywordstring) |  | v0.1.0 | String to display underneath the entity name
| attributes | [Attribute](#attribute)[] |  | v0.1.0 | Attributes to display
| url | [KString](#keywordstring) \| Boolean |  | v0.2.0 | Url to open on click/tap. (when `true` is used the target url becomes repo homepage)
| attribute_urls | Boolean |  | v0.2.0 | When set to `true` turns on default urls for all the displayed attributes

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

## Configuration example

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

## How to install?

Install HACS and add this repo as custom repository (lovelace plugins). Click on "Install".

If you have a YAML mode remember to add resource entry for the js bundle in ui-lovelace.yaml:

```yaml
resources:
  - url: /hacsfiles/github-flexi-card/github-flexi-card.js
    type: module
```