export interface ICardConfig {
    title: string,
    entities: IEntityConfig[]
}

export interface IEntityConfig {
    entity: string,
    attributes?: IAttribute[],
    name?: string,
    secondary_info?: string,
    icon?: string,
    url?: string | boolean,
    attribute_urls?: boolean,
}

export interface IAttribute {
    name: string,
    icon?: string,
    label?: string,
    url?: string | boolean,
}