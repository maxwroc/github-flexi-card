export const printVersion = () => console.info(
    "%c GITHUB-FLEXI-CARD %c [VI]{version}[/VI]",
    "color: white; background: #cca900; font-weight: 700;",
    "color: #cca900; background: white; font-weight: 700;",
);

/**
 * Cache for messages logged in the console already
 */
let logCache: IMap<number> = {};

/**
 * Clears the log cache to enable logging same messages again
 */
export const resetLogCache = () => logCache = {};

/**
 * Logs error in the browser dev console with card name prefix
 */
export const logError = (msg: string, andThrow?: boolean) => {

    if (logCache[msg]) {
        if (andThrow) {
            throw new Error(msg);
        }

        return;
    }

    console.error(`[github-flexi-card] ${msg}`);
    logCache[msg] = 1

    if (andThrow) {
        throw new Error(msg);
    }
};

/**
 * Gets the config value returning first not undefined value passed as arguments
 */
export const getConfigValue = <T>(...values: T[]): T => values.reduce((prev, curr) => prev !== undefined ? prev : curr);

/**
 * Returns array of values regardles if given value is string array or null
 * @param val Value to process
 */
export const safeGetArray = <T>(val: T | T[] | undefined): T[] => {
    if (Array.isArray(val)) {
        return val;
    }

    return val !== undefined ? [val] : [];
};

/**
 * Converts config value to array of specified objects.
 *
 * ISimplifiedArray config object supports simple list of strings or even an individual item. This function
 * ensures we're getting an array in all situations.
 *
 * E.g. all of the below are valid entries and can be converted to objects
 * 1. Single string
 *   my_setting: "name"
 * 2. Single object
 *   my_setting:
 *     by: "name"
 *     desc: true
 * 3. Array of strings
 *   my_setting:
 *     - "name"
 *     - "state"
 * 4. Array of objects
 *   my_setting:
 *     - by: "name"
 *     - by: "sort"
 *       desc: true
 *
 * @param value Config array
 * @param defaultKey Key of the object to populate
 * @returns Array of objects
 */
export const safeGetConfigArrayOfObjects = <T>(value: ISimplifiedArray<T>, defaultKey: keyof T): T[] => {
    return safeGetArray(value).map(v => safeGetConfigObject(v, defaultKey));
}

/**
 * Converts string to object with given property or returns the object if it is not a string
 * @param value Value from the config
 * @param propertyName Property name of the expected config object to which value will be assigned
 */
 export const safeGetConfigObject = <T>(value: IObjectOrString<T>, propertyName: keyof T): T => {

    switch (typeof value) {
        case "string":
            const result = <any>{};
            result[propertyName] = value;
            return result;
        case "object":
            // make a copy as the original one is immutable
            return { ...value };
    }

    return value;
}