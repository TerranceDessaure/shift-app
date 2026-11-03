import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { addDays, getMonday, toDateString, weekDays, formatDay, formatTime } from "./dates";
import { hoursForShift, hoursForShiftWithBreak, roundHours } from "./hours";

function MySchedule({ profile }) {
  const [shifts, setShifts] = useState([]);
  const [showBreaks, setShowBreaks] = useState(false);
  const [message, setMessage] = useState("");

  const week1Start = getMonday(new Date());
  const weeks = [
    { title: "This week", start: week1Start },
    { title: "Next week", start: addDays(week1Start, 7) },
  ];
  const startDate = toDateString(week1Start);
  const endDate = toDateString(addDays(week1Start, 12));
  const today = toDateString(new Date());

  useEffect(() => {
    async function loadShifts() {
      const { data, error } = await supabase
        .from("shifts")
        .select("id, shift_date, start_time, end_time")
        .eq("employee_id", profile.id)
        .gte("shift_date", startDate)
        .lte("shift_date", endDate)
        .order("shift_date")
        .order("start_time");

      if (error) {
        setMessage(`Couldn't load your schedule: ${error.message}`);
        return;
      }
      setShifts(data);
    }

    loadShifts();
  }, [profile.id]);

  return (
    <section>
      <h2>My schedule</h2>

      <label>
        <input
          type="checkbox"
          checked={showBreaks}
          onChange={(event) => setShowBreaks(event.target.checked)}
        />{" "}
        Compare with a 30-minute break
      </label>

      {message && <p>{message}</p>}

      {weeks.map((week) => {
        const days = weekDays(week.start);
        const weekShifts = shifts.filter((shift) => days.includes(shift.shift_date));

        let total = 0;
        let totalWithBreak = 0;
        for (const shift of weekShifts) {
          total += hoursForShift(shift);
          totalWithBreak += hoursForShiftWithBreak(shift);
        }

        return (
          <div key={week.title}>
            <h3>{week.title}</h3>
            <ul>
              {days.map((day) => {
                const dayShifts = weekShifts.filter((shift) => shift.shift_date === day);

                return (
                  <li key={day}>
                    <strong>
                      {formatDay(day)}
                      {day === today && " (today)"}:
                    </strong>{" "}
                    {dayShifts.length === 0
                      ? "Off"
                      : dayShifts.map((shift) => (
                          <span key={shift.id}>
                            {formatTime(shift.start_time)} – {formatTime(shift.end_time)} (
                            {roundHours(hoursForShift(shift))} hrs
                            {showBreaks &&
                              `, ${roundHours(hoursForShiftWithBreak(shift))} with break`}
                            ){" "}
                          </span>
                        ))}
                  </li>
                );
              })}
            </ul>
            <p>
              <strong>Total: {roundHours(total)} hours</strong>
              {showBreaks && ` (${roundHours(totalWithBreak)} with breaks)`}
            </p>
          </div>
        );
      })}
    </section>
  );
}

export default MySchedule;