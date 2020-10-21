export const printVersion = () => console.info(
    "%c GITHUB-FLEXI-CARD %c 1.0.0",
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