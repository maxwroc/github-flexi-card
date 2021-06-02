export const printVersion = () => console.info(
    "%c GITHUB-FLEXI-CARD %c 1.0.1",
    "color: white; background: #cca900; font-weight: 700;",
    "color: #cca900; background: white; font-weight: 700;",
);

/**
 * Logs error in the browser dev console with card name prefix
 */
export const logError = (msg: string) => console.error(`[github-flexi-card] ${msg}`);

/**
 * Gets the config value returning first not undefined value passed as arguments
 */
export const getConfigValue = <T>(...values: T[]): T => values.reduce((prev, curr) => prev !== undefined ? prev : curr);

/**
 * Converts string to object with given property or returns the object if it is not a string
 */
export const safeGetConfigObject = <T>(value: string | T, propertyName: string): T => {

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

/**
 * Returns array of values regardles if given value is string array or null
 * @param val Value to process
 */
export const safeGetArray = <T>(val: T | T[] | undefined): T[] => {
    if (Array.isArray(val)) {
        return val;
    }

    return val ? [val] : [];
};