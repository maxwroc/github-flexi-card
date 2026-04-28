
export const defaultConfig: ICardConfig = {
    repos: [],
    title: "Github repositories",
    name: "{path}",
    secondary_info: "{latest_release.attributes.tag|conditional()}",
    url: true,
    attribute_urls: true,
    compact_view: true,
    sort: ["stars", "issues"],
    attributes: ["stars", "issues", "pull_requests", "forks", "watchers"]
}