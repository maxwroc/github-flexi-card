interface IEntityProperties {
    attributes?: IAttribute[],
    name?: string,
    secondary_info?: string,
    icon?: string,
    url?: string | boolean,
    attribute_urls?: boolean,
}

export interface ICardConfig extends IEntityProperties {
    title: string,
    entities: (IEntityConfig | string)[],
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