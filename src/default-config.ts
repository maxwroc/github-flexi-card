
export const defaultConfig: ICardConfig = {
    repos: [],
    title: "Github repositories",
    name: "{path}",
    secondary_info: "{latest_release|conditional()}",
    url: true,
    attribute_urls: true,
    sort: ["stars", "issues"],
    attributes: ["stars", "issues", "pull_requests", "forks", "watchers"]
}