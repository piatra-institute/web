/**
 * Shared date parsing for the four index pages (playgrounds, press, papers,
 * policies). Each page stores dates in a slightly different format; this
 * module normalises them to { year, month? } so a single year/month filter
 * can cover all of them.
 *
 * Supported input formats:
 *   "February 2024" → { year: '2024', month: '02' }   playgrounds, papers
 *   "2026-03"        → { year: '2026', month: '03' }   policies
 *   "2025"           → { year: '2025', month: null }   press (year-only)
 */

export const MONTH_NAMES: Record<string, string> = {
    'January': '01',
    'February': '02',
    'March': '03',
    'April': '04',
    'May': '05',
    'June': '06',
    'July': '07',
    'August': '08',
    'September': '09',
    'October': '10',
    'November': '11',
    'December': '12',
};

export const MONTH_NAMES_INVERSE: Record<string, string> = Object.fromEntries(
    Object.entries(MONTH_NAMES).map(([name, num]) => [num, name]),
);

export interface ParsedIndexDate {
    year: string;
    month: string | null;
}

export function parseIndexDate(s: string | null | undefined): ParsedIndexDate | null {
    if (!s) return null;
    const trimmed = s.trim();
    if (!trimmed) return null;

    // "Month YYYY" e.g. "February 2024"
    const monthSpace = trimmed.split(' ');
    if (monthSpace.length === 2) {
        const [monthName, year] = monthSpace;
        const month = MONTH_NAMES[monthName];
        if (month && /^\d{4}$/.test(year)) {
            return { year, month };
        }
    }

    // "YYYY-MM" e.g. "2026-03"
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
    if (isoMatch) {
        return { year: isoMatch[1], month: isoMatch[2] };
    }

    // "YYYY" e.g. "2025"
    if (/^\d{4}$/.test(trimmed)) {
        return { year: trimmed, month: null };
    }

    return null;
}

/**
 * Convert a parsed date back to a display string. Returns "March 2026" when
 * a month is present, "2026" otherwise.
 */
export function formatIndexDate(parsed: ParsedIndexDate | null): string {
    if (!parsed) return '';
    if (parsed.month && MONTH_NAMES_INVERSE[parsed.month]) {
        return `${MONTH_NAMES_INVERSE[parsed.month]} ${parsed.year}`;
    }
    return parsed.year;
}
