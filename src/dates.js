// Format a date as "YYYY-MM-DD" using the local time zone
export function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// A new date that's a number of day later (or earlier, if negative)
export function addDays(day, days){
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// The Monday of this week. On Sunday (store closed), the upcoming Monday
export function getMonday(date) {
    const day = date.getDay(); // 0 = Sunday ... 6 = Saturday
    const diff = day === 0 ? 1 : 1 - day;
    return addDays(date, diff)
}

// "2026-10-27" → "Tue, Oct 27"
export function formatDay(dateString) {
  return new Date(`${dateString}T00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}