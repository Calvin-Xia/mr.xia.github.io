export interface ReadingStats {
    characters: number;
    wordCount: number;
    totalCount: number;
    readTimeMinutes: number;
    readTimeDisplay: string;
    wordCountDisplay: string;
    /** Backward-compatible alias for readTimeDisplay. Prefer readTimeDisplay in new code. */
    display: string;
}

export function stripReadableText(body?: string): string;
export function countCharacters(text?: string): number;
export function countWords(text?: string): number;
export function formatReadTime(minutes?: number): string;
export function formatWordCount(count?: number): string;
export function computeReadingStats(body?: string): ReadingStats;
