// Asia/Colombo timezone utilities
export function nowUTC(): Date {
  return new Date();
}

export function nowColombo(): Date {
  // Get current time in Asia/Colombo timezone
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const colomboOffset = 5.5; // UTC+5:30
  return new Date(utc + (colomboOffset * 3600000));
}

export function formatColombo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return d.toLocaleString("en-US", { 
      timeZone: "Asia/Colombo",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    // Fallback if timezone is not supported
    return d.toLocaleString();
  }
}

export function todayColombo(): string {
  return nowColombo().toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}