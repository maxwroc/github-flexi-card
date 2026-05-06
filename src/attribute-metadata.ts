export interface IAttributeMetadata {
    text: string,
    icon?: string,
    urlPath?: string,
    translationKey?: string,
    visibleInEditor?: boolean,
    sortable?: boolean,
}

export const ATTRIBUTE_METADATA: IMap<IAttributeMetadata> = {
    "forks": {
        text: "Forks",
        icon: "mdi:source-fork",
        urlPath: "network/members",
        translationKey: "forks_count",
        sortable: true,
    },
    "issues": {
        text: "Issues",
        icon: "mdi:alert-circle-outline",
        urlPath: "issues",
        translationKey: "issues_count",
        sortable: true,
    },
    "pull_requests": {
        text: "Pull requests",
        icon: "mdi:source-pull",
        urlPath: "pulls",
        translationKey: "pulls_count",
        sortable: true,
    },
    "merged_pull_requests": {
        text: "Merged pull requests",
        icon: "mdi:source-merge",
        urlPath: "pulls?q=is%3Apr+is%3Amerged",
        translationKey: "merged_pulls_count",
        sortable: true,
    },
    "stars": {
        text: "Stars",
        icon: "mdi:star",
        urlPath: "stargazers",
        translationKey: "stargazers_count",
        sortable: true,
    },
    "watchers": {
        text: "Watchers",
        icon: "mdi:glasses",
        urlPath: "watchers",
        translationKey: "subscribers_count",
        sortable: true,
    },
    "discussions": {
        text: "Discussions",
        icon: "mdi:forum",
        urlPath: "discussions",
        translationKey: "discussions_count",
        sortable: true,
    },
    "latest_commit": {
        text: "Latest commit",
        icon: "mdi:source-commit",
        urlPath: "commits",
        translationKey: "latest_commit",
        visibleInEditor: false,
    },
    "latest_issue": {
        text: "Latest issue",
        icon: "mdi:alert-circle-outline",
        urlPath: "issues",
        translationKey: "latest_issue",
        visibleInEditor: false,
    },
    "latest_pull_request": {
        text: "Latest pull request",
        icon: "mdi:source-pull",
        urlPath: "pulls",
        translationKey: "latest_pull_request",
        visibleInEditor: false,
    },
    "latest_release": {
        text: "Latest release",
        icon: "mdi:tag-outline",
        urlPath: "releases",
        translationKey: "latest_release",
        visibleInEditor: false,
    },
    "latest_tag": {
        text: "Latest tag",
        icon: "mdi:tag-outline",
        urlPath: "tags",
        translationKey: "latest_tag",
    },
    "latest_discussion": {
        text: "Latest discussion",
        icon: "mdi:forum",
        urlPath: "discussions",
        translationKey: "latest_discussion",
        visibleInEditor: false,
    },
    "home": {
        text: "Repository",
        urlPath: "",
        visibleInEditor: false,
    },
};

export const TRANSLATION_KEY_TO_ENTITY_KEY: Record<string, string> = Object.entries(ATTRIBUTE_METADATA)
    .reduce((mapping, [entityKey, metadata]) => {
        const translationKey = metadata.translationKey;
        if (translationKey) {
            mapping[translationKey] = entityKey;
        }

        return mapping;
    }, {} as Record<string, string>);

export const AVAILABLE_ATTRIBUTE_KEYS = Object.entries(ATTRIBUTE_METADATA)
    .filter(([key, metadata]) => key !== "home" && metadata.visibleInEditor !== false)
    .map(([key]) => key);

export const SORTABLE_ATTRIBUTE_KEYS = Object.entries(ATTRIBUTE_METADATA)
    .filter(([key, metadata]) => key !== "home" && metadata.sortable === true)
    .map(([key]) => key);

export const getAttributeMetadata = (attributeName: string): IAttributeMetadata | undefined => {
    const key = attributeName.split(".")[0];
    return ATTRIBUTE_METADATA[key];
};
