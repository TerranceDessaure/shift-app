export function shiftHours(start, end) {
  return end - start;
}

export function shiftHoursWithBreak(start, end) {
  const hours = shiftHours(start, end);
  if (hours > 6) {
    return hours - 0.5; // 30-minute break on shifts over 6 hours
  }
  return hours;
}

// Convert "09:30" or "09:30:00" into 9.5
export function timeToHours(time){
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
}