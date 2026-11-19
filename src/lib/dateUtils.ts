/**
 * Parses a date string from Google Sheets or mock data into a local-midnight Date object,
 * avoiding the standard JavaScript `new Date('YYYY-MM-DD')` UTC-midnight shift that causes
 * dates to display one day earlier in western timezones.
 */
export const parseLocalDate = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  const trimmed = String(dateStr).trim();
  if (!trimmed) return null;

  // Match ISO-like dates: YYYY-MM-DD, YYYY/MM/DD, or YYYY-MM-DDTHH:mm:ss...
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
  }

  // Match US-style dates: MM/DD/YYYY, M/D/YYYY, MM-DD-YYYY
  const usMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10) - 1;
    const day = parseInt(usMatch[2], 10);
    const year = parseInt(usMatch[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
  }

  // Fallback for natural-language strings (e.g., "Nov 21, 2026")
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
};

/**
 * Formats a date string safely in local calendar terms without timezone day-shifting.
 */
export const formatDateDisplay = (
  dateStr?: string | null,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string => {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  if (!d) return String(dateStr);
  return d.toLocaleDateString('en-US', options);
};

/**
 * Compares two date strings (with optional time strings) for sorting.
 * Returns < 0 if a is earlier than b (ascending order).
 */
export const compareDatesAsc = (
  dateA?: string | null,
  dateB?: string | null,
  timeA?: string | null,
  timeB?: string | null
): number => {
  const dA = parseLocalDate(dateA);
  const dB = parseLocalDate(dateB);

  if (dA && dB) {
    const diff = dA.getTime() - dB.getTime();
    if (diff !== 0) return diff;
  } else if (dA && !dB) {
    return -1;
  } else if (!dA && dB) {
    return 1;
  } else {
    const strCmp = (dateA || '').localeCompare(dateB || '');
    if (strCmp !== 0) return strCmp;
  }

  return (timeA || '').localeCompare(timeB || '');
};

/**
 * Compares two date strings (with optional time strings) for descending sorting (newest first).
 */
export const compareDatesDesc = (
  dateA?: string | null,
  dateB?: string | null,
  timeA?: string | null,
  timeB?: string | null
): number => {
  return compareDatesAsc(dateB, dateA, timeB, timeA);
};

/**
 * Calculates accurate age in years from a date-of-birth string without UTC off-by-one errors.
 */
export const calculateAge = (dobStr?: string | null): number | null => {
  const birthDate = parseLocalDate(dobStr);
  if (!birthDate) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};
