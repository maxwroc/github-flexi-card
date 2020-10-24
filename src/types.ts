interface IEntityProperties {
    attributes?: (IAttribute | string)[],
    name?: string,
    secondary_info?: string,
    icon?: string,
    url?: string | boolean,
    attribute_urls?: boolean,
    compact_view?: boolean,
}

export interface ICardConfig extends IEntityProperties {
    title: string,
    entities: (IEntityConfig | string)[],
    sort?: ISortOptions[],
}

export interface IEntityConfig extends IEntityProperties{
    entity: string,
}

export interface IAttribute {
    name: string,
    icon?: string,
    label?: string,
    url?: string | boolean,
}

export interface IMap<T> {
    [key: string]: T
}

export interface ISortOptions {
    by: string,
    ascending?: boolean,
}