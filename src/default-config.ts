
export const defaultConfig: ICardConfig = {
    entities: [],
    auto: "_latest_release",
    title: "Github repositories",
    name: "{path}",
    secondary_info: "{latest_release_tag}",
    url: true,
    attribute_urls: true,
    sort: ["stars", "issues"],
    attributes: ["stars", "issues", "pull_requests", "forks", "watchers"]
}