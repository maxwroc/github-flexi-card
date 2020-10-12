# Github Flexi Card
Home Assistant card displaying data from [Github integration](https://www.home-assistant.io/integrations/github/)

## Overview

The aim of this card is to show all the data provided by github integration. You can specify what kind of data is shown and where. Entity rows are matching the size of other standard entity rows from other native cards (e.g. height of the row, icon/text margins, font sizes, etc).

![image](https://user-images.githubusercontent.com/8268674/95760202-a2c53300-0ca2-11eb-8bb5-be1d0037fb85.png)

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
    name: Url Editor Pro
    secondary_info: 'Clones: {clones}'
    attributes:
      - name: views
      - name: stargazers
      - name: open_issues
```