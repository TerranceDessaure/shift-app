import { roleNames } from "./roles";
import { hoursForShift } from "./hours";
import { weekDays, formatDay } from "./dates";

function WeekView({ title, weekStart, shifts, editingId, onEdit, onDelete }) {
  // The dates for Monday through Saturday of this week
  const days = weekDays(weekStart);

  // Only the shifts that fall in this week
  const weekShifts = shifts.filter((shift) => days.includes(shift.shift_date));

  // Add up hours per employee
  const totals = {};
  for (const shift of weekShifts) {
    if (!totals[shift.employee_id]) {
      totals[shift.employee_id] = {
        id: shift.employee_id,
        name: shift.employee.full_name,
        hours: 0,
      };
    }
    totals[shift.employee_id].hours += hoursForShift(shift);
  }

  // Turn the totals into a list, most hours first
  const summary = Object.values(totals).sort((a, b) => b.hours - a.hours);

  return (
    <section>
      <h3>{title}</h3>

      {days.map((day) => {
        const dayShifts = weekShifts.filter((shift) => shift.shift_date === day);

        return (
          <div key={day}>
            <h4>{formatDay(day)}</h4>
            {dayShifts.length === 0 ? (
              <p>No shifts</p>
            ) : (
              <ul>
                {dayShifts.map((shift) => (
                  <li
                    key={shift.id}
                    style={{ fontWeight: shift.id === editingId ? "bold" : "normal" }}
                  >
                    {shift.employee.full_name} ({roleNames[shift.employee.role]}),{" "}
                    {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)},{" "}
                    {hoursForShift(shift)} hours{" "}
                    <button type="button" onClick={() => onEdit(shift)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(shift)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      <h4>Hours this week</h4>
      {summary.length === 0 ? (
        <p>No hours scheduled.</p>
      ) : (
        <ul>
          {summary.map((person) => (
            <li key={person.id}>
              {person.name}: {Number(person.hours.toFixed(2))} hours{" "}
              {person.hours > 40 && <strong>⚠ Overtime</strong>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default WeekView;