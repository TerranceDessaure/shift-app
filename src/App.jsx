import SignUp from "./SignUp";

function shiftHours(start, end) {
  return end - start;
}


function shiftHoursWithBreak(start, end) {
  const hours = shiftHours(start, end);
  if (hours > 6) {
    return hours - 0.5; // subtract 30 mins for break
  }
  return hours;
}

const myWeek = [
  { day: "Monday", start: 9, end: 17 },
  { day: "Tuesday", start: 12, end: 21 },
  { day: "Thursday", start: 9, end: 21 },
  { day: "Friday", start: 9, end: 17 },
  { day: "Saturday", start: 10, end: 17 },
];

function App() {
  let totalHours = 0;
  for (const shift of myWeek) {
    totalHours += shiftHours(shift.start, shift.end);
  }

  return (
    <div>
      <h1>My Shifts</h1>
      <SignUp />
      <ul>
        {myWeek.map((shift) => (
          <li key={shift.day}>
            {shift.day}: {shiftHours(shift.start, shift.end)} hours (
              {shiftHoursWithBreak(shift.start, shift.end)} with break)
          </li>
        ))}
      </ul> <p> Total hours this week: {totalHours}</p>
      {totalHours > 40 && <p>Overtime warning!</p>}
    </div>
  );
}

export default App;