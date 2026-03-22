// Locale utilities — detect the user's timezone and format times in their local zone.
// Used to show live session times in the user's local time rather than UTC.
// No external API needed — all done via the browser's built-in Intl API.

// Get the user's local timezone (e.g. "Europe/London", "America/New_York")
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

// Format a UTC date string into the user's local time
// e.g. formatLocalTime("2025-04-01T18:00:00Z") → "7:00 PM BST"
export function formatLocalTime(utcDateString: string): string {
  try {
    const date = new Date(utcDateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return utcDateString;
  }
}

// Format a UTC date string into a friendly local date + time
// e.g. "Tuesday 1 April at 7:00 PM BST"
export function formatLocalDateTime(utcDateString: string): string {
  try {
    const date = new Date(utcDateString);
    const datePart = date.toLocaleDateString([], {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timePart = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
    return `${datePart} at ${timePart}`;
  } catch {
    return utcDateString;
  }
}

// Detect approximate currency from the browser locale
// Used to show rough price equivalents alongside GBP prices
export function getLocalCurrencyHint(): { symbol: string; note: string } | null {
  try {
    const locale = navigator.language || "en-GB";
    const region = locale.split("-")[1]?.toUpperCase();

    const currencyMap: Record<string, { symbol: string; note: string }> = {
      US: { symbol: "$", note: "≈ $25/mo" },
      AU: { symbol: "A$", note: "≈ A$38/mo" },
      CA: { symbol: "C$", note: "≈ C$34/mo" },
      EU: { symbol: "€", note: "≈ €23/mo" },
      DE: { symbol: "€", note: "≈ €23/mo" },
      FR: { symbol: "€", note: "≈ €23/mo" },
      ES: { symbol: "€", note: "≈ €23/mo" },
      IT: { symbol: "€", note: "≈ €23/mo" },
      AE: { symbol: "د.إ", note: "≈ AED 92/mo" },
      SA: { symbol: "ر.س", note: "≈ SAR 94/mo" },
    };

    return currencyMap[region] ?? null;
  } catch {
    return null;
  }
}
