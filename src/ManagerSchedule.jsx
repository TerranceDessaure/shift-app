import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { roleNames } from "./roles";
import { toDateString, addDays, getMonday } from "./dates";
import WeekView from "./WeekView";


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

// Returns a problem message, or null if the shift is fine.
function validateShift(shiftDate, startTime, endTime) {
  const dayOfWeek = new Date(`${shiftDate}T00:00`).getDay();
  const hours = storeHours[dayOfWeek];

  if (!hours) {
    return "The store is closed on Sundays.";
  }
  if (startTime < hours.open || endTime > hours.close) {
    return `Shifts that day must be between ${hours.open} and ${hours.close}.`;
  }
  if (endTime <= startTime) {
    return "The shift must end after it starts.";
  }
  return null;
}

function ManagerSchedule({ profile }) {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null); // NEW: which shift is being edited

  // The next two weeks
  const week1Start = getMonday(new Date());
  const week2Start = addDays(week1Start, 7);
  const startDate = toDateString(week1Start);
  const endDate = toDateString(addDays(week1Start, 12)); // Saturday of next week

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
      // NEW: employee_id added, so Edit can fill in the dropdown
      .select("id, employee_id, shift_date, start_time, end_time, employee:profiles(full_name, role)")
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

  // NEW: clear the form and go back to "add" mode
  function resetForm() {
    setEditingId(null);
    setEmployeeId("");
    setShiftDate("");
    setStartTime("09:00");
    setEndTime("17:00");
  }

  // NEW: fill the form with a shift's details to edit it
  function startEdit(shift) {
    setEditingId(shift.id);
    setEmployeeId(shift.employee_id);
    setShiftDate(shift.shift_date);
    setStartTime(shift.start_time.slice(0, 5));
    setEndTime(shift.end_time.slice(0, 5));
    setMessage("");
  }

  // CHANGED: handles both adding and editing
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const problem = validateShift(shiftDate, startTime, endTime);
    if (problem) {
      setMessage(problem);
      return;
    }

    const shiftData = {
      employee_id: employeeId,
      shift_date: shiftDate,
      start_time: startTime,
      end_time: endTime,
    };

    const request = editingId
      ? supabase.from("shifts").update(shiftData).eq("id", editingId)
      : supabase.from("shifts").insert({ ...shiftData, restaurant_id: profile.restaurant_id });

    const { error } = await request;

    if (error) {
      setMessage(`Couldn't save shift: ${error.message}`);
      return;
    }

    setMessage(editingId ? "Shift updated!" : "Shift added!");
    resetForm();
    loadShifts();
  }

  // NEW: delete a shift after confirming
  async function handleDelete(shift) {
    const confirmed = window.confirm(
      `Delete ${shift.employee.full_name}'s shift on ${shift.shift_date}?`
    );
    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("shifts").delete().eq("id", shift.id);

    if (error) {
      setMessage(`Couldn't delete shift: ${error.message}`);
      return;
    }

    if (shift.id === editingId) {
      resetForm();
    }
    setMessage("Shift deleted.");
    loadShifts();
  }

  // Copy this week's shifts into next week
async function handleCopyWeek() {
  const week2StartDate = toDateString(week2Start);
  const thisWeekCount = shifts.filter((shift) => shift.shift_date < week2StartDate).length;
  const nextWeekCount = shifts.length - thisWeekCount;

  if (thisWeekCount === 0) {
    setMessage("This week has no shifts to copy.");
    return;
  }

  const question =
    nextWeekCount > 0
      ? `Next week already has ${nextWeekCount} shift(s). Copying will REPLACE them with this week's ${thisWeekCount} shift(s). Continue?`
      : `Copy this week's ${thisWeekCount} shift(s) to next week?`;

  if (!window.confirm(question)) {
    return;
  }

  const { data, error } = await supabase.rpc("copy_week", {
    p_from_monday: startDate,
  });

  if (error) {
    setMessage(`Couldn't copy the week: ${error.message}`);
    return;
  }

  resetForm();
  setMessage(`Copied ${data} shift(s) to next week.`);
  loadShifts();
}


  return (
    <div>
      <h2>Schedule: {startDate} to {endDate}</h2>

      <form onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit shift" : "Add a shift"}</h3>
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
        <button type="submit">{editingId ? "Save changes" : "Add shift"}</button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {message && <p>{message}</p>}

      <button type="button" onClick={handleCopyWeek}>
         Copy this week to next week
       </button>

        <WeekView
          title="This week"
          weekStart={week1Start}
          shifts={shifts}
          editingId={editingId}
          onEdit={startEdit}
          onDelete={handleDelete}
       />
        <WeekView
          title="Next week"
          weekStart={week2Start}
          shifts={shifts}
          editingId={editingId}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
    </div>
  );
}

export default ManagerSchedule;