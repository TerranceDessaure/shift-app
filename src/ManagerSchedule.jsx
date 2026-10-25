import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { roleNames } from "./roles";
import { shiftHours, timeToHours } from "./hours";

// Format a date as "YYYY-MM-DD" using the local time zone
function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Store hours, including the hour before opening and after closing
const storeHours = {
  1: { open: "09:00", close: "21:00" }, // Monday
  2: { open: "09:00", close: "21:00" },
  3: { open: "09:00", close: "21:00" },
  4: { open: "09:00", close: "21:00" },
  5: { open: "09:00", close: "21:00" }, // Friday
  6: { open: "10:00", close: "17:00" }, // Saturday
  // Sunday (0) is missing on purpose: closed
};

function ManagerSchedule({ profile }) {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [message, setMessage] = useState("");

  // The next two weeks
  const today = new Date();
  const twoWeeksOut = new Date();
  twoWeeksOut.setDate(today.getDate() + 13);
  const startDate = toDateString(today);
  const endDate = toDateString(twoWeeksOut);

  async function loadEmployees() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .order("full_name");

    if (error) {
      setMessage(`Couldn't load employees: ${error.message}`);
      return;
    }
    setEmployees(data);
  }

  async function loadShifts() {
    const { data, error } = await supabase
      .from("shifts")
      .select("id, shift_date, start_time, end_time, employee:profiles(full_name, role)")
      .gte("shift_date", startDate)
      .lte("shift_date", endDate)
      .order("shift_date")
      .order("start_time");

    if (error) {
      setMessage(`Couldn't load shifts: ${error.message}`);
      return;
    }
    setShifts(data);
  }

  useEffect(() => {
    loadEmployees();
    loadShifts();
  }, []);

  async function handleAddShift(event) {
    event.preventDefault();
    setMessage("");

    // Check the shift fits within store hours
    const dayOfWeek = new Date(`${shiftDate}T00:00`).getDay();
    const hours = storeHours[dayOfWeek];

    if (!hours) {
      setMessage("The store is closed on Sundays.");
      return;
    }
    if (startTime < hours.open || endTime > hours.close) {
      setMessage(`Shifts that day must be between ${hours.open} and ${hours.close}.`);
      return;
    }
    if (endTime <= startTime) {
      setMessage("The shift must end after it starts.");
      return;
    }

    const { error } = await supabase.from("shifts").insert({
      restaurant_id: profile.restaurant_id,
      employee_id: employeeId,
      shift_date: shiftDate,
      start_time: startTime,
      end_time: endTime,
    });

    if (error) {
      setMessage(`Couldn't add shift: ${error.message}`);
      return;
    }

    setMessage("Shift added!");
    loadShifts();
  }

  return (
    <div>
      <h2>Schedule: {startDate} to {endDate}</h2>

      <form onSubmit={handleAddShift}>
        <h3>Add a shift</h3>
        <select
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          required
        >
          <option value="">Choose an employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name} ({roleNames[employee.role]})
            </option>
          ))}
        </select>
        <input
          type="date"
          value={shiftDate}
          onChange={(event) => setShiftDate(event.target.value)}
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
        />
        <input
          type="time"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          required
        />
        <button type="submit">Add shift</button>
      </form>

      {message && <p>{message}</p>}

      <h3>Upcoming shifts</h3>
      {shifts.length === 0 && <p>No shifts scheduled yet.</p>}
      <ul>
        {shifts.map((shift) => (
          <li key={shift.id}>
            {shift.shift_date}: {shift.employee.full_name} (
            {roleNames[shift.employee.role]}), {shift.start_time.slice(0, 5)}–
            {shift.end_time.slice(0, 5)}, {" "}
            {shiftHours(timeToHours(shift.start_time), timeToHours(shift.end_time))} hours
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManagerSchedule;