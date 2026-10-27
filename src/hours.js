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

// Hours for one shift from the database, like { start_time: "09:00:00", end_time: "17:00:00" }
export function hoursForShift(shift) {
  return shiftHours(timeToHours(shift.start_time), timeToHours(shift.end_time));
}