# Github Flexi Card
Home Assistant card displaying data from [Github integration](https://www.home-assistant.io/integrations/github/)

## Overview

The aim of this card is to show all the data provided by github integration. You can specify what kind of data is shown and where. Entity rows are matching the size of other standard entity rows from other native cards (e.g. height of the row, icon/text margins, font sizes, etc).

![image](https://user-images.githubusercontent.com/8268674/95763370-d904b180-0ca6-11eb-9951-56c8200ee025.png)

Example configuration
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