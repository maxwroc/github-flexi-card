/**
 * This way we can import css files as modules (for TS compiler to not complain)
 */
declare module "*.css";

interface IEntityProperties {
    attributes?: (IAttribute | string)[],
    name?: string,
    secondary_info?: string,
    icon?: string,
    url?: string | boolean,
    attribute_urls?: boolean,
    compact_view?: boolean,
}

interface ICardConfig extends IEntityProperties {
    title: string,
    entities: (IEntityConfig | string)[],
    sort?: ISortOptions[],
}

interface IEntityConfig extends IEntityProperties{
    entity: string,
}

interface IAttribute {
    name: string,
    icon?: string,
    label?: string,
    url?: string | boolean,
}

interface IMap<T> {
    [key: string]: T
}

interface ISortOptions {
    by: string,
    ascending?: boolean,
}