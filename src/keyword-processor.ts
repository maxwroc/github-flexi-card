/**
 * Class for processing keyword strings
 */
export class KeywordStringProcessor {
    constructor(private onMatch: { (match: string): string }) {
    }

    /**
     * Replaces keywords in given string with the data
     */
    process(text?: string): string | undefined {
        if (!text) {
            return text;
        }

        return text.replace(/\{([^\}]+)\}/g, (match, keyword) => this.replaceKeyword(keyword, match));
    }

    /**
     * Converts keyword in the final value
     */
    private replaceKeyword(keyword: string, defaultValue: string): string {
        const chunks = keyword.split(":");
        const attributeName = chunks[0];
        const processingDetails = chunks[1];

        const value = this.onMatch(attributeName);

        if (value === undefined) {
            return defaultValue;
        }

        const processor = this.getProcessor(processingDetails);

        return processor(value);
    }

    /**
     * Returns value processor (if any processing options were specified)
     */
    private getProcessor(processingDetails: string): { (text: string): string } {
        if (!processingDetails) {
            return (text) => text;
        }

        // check if we should replace string in the value
        if (processingDetails.includes("=")) {
            const replaceDataChunks = processingDetails.split("=");
            return (text) => text.replace(replaceDataChunks[0], replaceDataChunks[1]);
        }

        return (text) => text;
    }
}