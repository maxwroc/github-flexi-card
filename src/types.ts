export interface ICardConfig {
    title: string,
    entities: IEntityConfig[]
}

export interface IEntityConfig {
    entity_id: string,
    attributes: IAttribute[],
    name?: string,
    secondary_info?: string,
    icon?: string,
}

interface IAttribute {
    name: string,
    icon?: string,
    label?: string,
    url?: string,
}