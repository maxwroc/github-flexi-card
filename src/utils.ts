export const printVersion = () => console.info(
    "%c GITHUB-FLEXI-CARD %c 0.5.0",
    "color: white; background: #cca900; font-weight: 700;",
    "color: #cca900; background: white; font-weight: 700;",
);

export const logError = (msg: string) => console.error(`[github-flexi-card] ${msg}`);