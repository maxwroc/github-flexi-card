/**
 * This way we can import css files as modules (for TS compiler to not complain)
 */
declare module "*.css";

interface ICardConfig extends Omit<IEntityConfig, "entity"> {
    title?: string,
    entities: ISimplifiedArray<IEntityConfig>,
    sort?: ISimplifiedArray<ISortOptions>,
    auto?: boolean | string,
}

interface IEntityConfig {
    entity: string,
    attributes?: ISimplifiedArray<IAttribute>,
    name?: string,
    secondary_info?: string,
    icon?: string,
    icon_color?: string,
    url?: string | boolean,
    attribute_urls?: boolean,
    attribute_color?: string,
    compact_view?: boolean,
}

interface IAttribute {
    name: string,
    icon?: string,
    label?: string,
    url?: string | boolean,
    color?: string,
}

interface IMap<T> {
    [key: string]: T
}

interface ISortOptions {
    by: string,
    ascending?: boolean,
}

type IObjectOrString<T> = T | string;
type ISimplifiedArray<T> = IObjectOrString<T> | IObjectOrString<T>[] | undefined;

interface HomeAssistantWindow extends Window {
    customCards: ICardInfo[] | undefined;
}

interface ICardInfo {
    type: string;
    name: string;
    description: string;
    preview?: boolean;
    documentationURL?: string;
}