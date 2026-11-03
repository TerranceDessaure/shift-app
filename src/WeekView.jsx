import { roleNames } from "./roles";
import { weekDays, formatDay, formatTime } from "./dates";
import { hoursForShift, roundHours } from "./hours";

function WeekView({ title, weekStart, shifts, editingId, onEdit, onDelete }) {
  const days = weekDays(weekStart);
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
              <p className="muted">No shifts</p>
            ) : (
              <ul>
                {dayShifts.map((shift) => (
                  <li
                    key={shift.id}
                    className={shift.id === editingId ? "shift-row editing" : "shift-row"}
                  >
                    <span>
                      <strong>{shift.employee.full_name}</strong>{" "}
                      <span className="muted">({roleNames[shift.employee.role]})</span>
                      <br />
                      {formatTime(shift.start_time)} – {formatTime(shift.end_time)} ·{" "}
                      {roundHours(hoursForShift(shift))} hrs
                    </span>
                    <span className="actions">
                      <button type="button" className="secondary small" onClick={() => onEdit(shift)}>
                        Edit
                      </button>
                      <button type="button" className="danger small" onClick={() => onDelete(shift)}>
                        Delete
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      <h4>Hours this week</h4>
      {summary.length === 0 ? (
        <p className="muted">No hours scheduled.</p>
      ) : (
        <ul>
          {summary.map((person) => (
            <li key={person.id}>
              {person.name}: {roundHours(person.hours)} hours{" "}
              {person.hours > 40 && <strong className="warning">⚠ Overtime</strong>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default WeekView;