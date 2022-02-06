import { logError } from "./utils";

const validEntityDomains = ["sensor", "binary_sensor"];

/**
 * Class for processing keyword strings
 */
 export class RichStringProcessor {

    constructor(private onMatch: { (match: string): string | undefined }) {
    }

    /**
     * Replaces keywords in given string with the data
     */
    process(text: string | undefined): string | undefined {
        if (text === undefined || text === "") {
            return text;
        }

        return text.replace(/\{([^\}]+)\}/g, (matchWithBraces, keyword) => this.replaceKeyword(keyword, matchWithBraces));
    }

    /**
     * Converts keyword in the final value
     */
    private replaceKeyword(keyword: string, defaultValue: string): string {
        const processingDetails = keyword.split("|");
        const dataSource = processingDetails.shift();

        const value = dataSource === undefined ? undefined : this.onMatch(dataSource);

        const processors = processingDetails.map(command => {
            const match = commandPattern.exec(command);
            if (!match || !match.groups || !availableProcessors[match.groups.func]) {
                return undefined;
            }

            return availableProcessors[match.groups.func](match.groups.params);
        });

        const result = processors.filter(p => p !== undefined).reduce((res, proc) => proc!(res), value);

        return result === undefined ? defaultValue : result;
    }
}

const commandPattern = /(?<func>[a-z]+)\((?<params>[^\)]*)\)/;

const availableProcessors: IMap<IProcessorCtor> = {
    "replace": (params) => {
        const replaceDataChunks = params.split(",");
        if (replaceDataChunks.length != 2) {
            logError("'replace' function param has to have two parameters");
            return undefined;
        }

        return val => {
            return val !== undefined ? val.replace(replaceDataChunks[0], replaceDataChunks[1]) : undefined;
        };
    },
    "round": (params) => {
        let decimalPlaces = parseInt(params);
        if (isNaN(decimalPlaces)) {
            decimalPlaces = 0;
        }

        return val => val !==undefined ? parseFloat(val).toFixed(decimalPlaces) : undefined;
    },
    "conditional": (params) => {
        return val => val !== undefined ? val : "";
    }
}

interface IProcessor {
    (val: string | undefined): string | undefined;
}

interface IProcessorCtor {
    (params: string): IProcessor | undefined
}