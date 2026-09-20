import { getMonthGrid, getTodayKey, WEEKDAYS } from '../utils/calendarGrid.js';
import './Calendar.css';

function Calendar({
  year,
  month,
  entryCounts,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}) {
  const weeks = getMonthGrid(year, month);
  const todayKey = getTodayKey();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" onClick={onPrevMonth} aria-label="前月">
          ◀
        </button>
        <span className="calendar-title">
          {year}年{month + 1}月
        </span>
        <button type="button" onClick={onNextMonth} aria-label="翌月">
          ▶
        </button>
        <button type="button" onClick={onToday} className="calendar-today-button">
          今日
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="calendar-weekday">
            {weekday}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {weeks.flat().map((dateKey, index) => {
          if (!dateKey) {
            return <div key={`blank-${index}`} className="calendar-cell calendar-cell-blank" />;
          }

          const day = Number(dateKey.slice(-2));
          const count = entryCounts[dateKey] ?? 0;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;

          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={[
                'calendar-cell',
                isToday && 'calendar-cell-today',
                isSelected && 'calendar-cell-selected',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="calendar-day">{day}</span>
              {count > 0 && (
                <span className="calendar-entry-mark" aria-label={`${count}件の日記`}>
                  {count > 1 ? count : '●'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
