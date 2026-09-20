import { useState } from 'react';
import Calendar from './components/Calendar.jsx';
import DayEntryList from './components/DayEntryList.jsx';
import useMonthEntries from './hooks/useMonthEntries.js';
import { getTodayKey } from './utils/calendarGrid.js';
import './App.css';

function getInitialYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function App() {
  const [{ year, month }, setYearMonth] = useState(getInitialYearMonth);
  const [selectedDate, setSelectedDate] = useState(getTodayKey);
  const { entriesByDate, isLoading } = useMonthEntries(year, month);

  function goToPrevMonth() {
    setYearMonth((current) =>
      current.month === 0
        ? { year: current.year - 1, month: 11 }
        : { year: current.year, month: current.month - 1 }
    );
  }

  function goToNextMonth() {
    setYearMonth((current) =>
      current.month === 11
        ? { year: current.year + 1, month: 0 }
        : { year: current.year, month: current.month + 1 }
    );
  }

  function goToToday() {
    const now = new Date();
    setYearMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(getTodayKey());
  }

  const entryCounts = Object.fromEntries(
    Object.entries(entriesByDate).map(([date, entries]) => [date, entries.length])
  );

  return (
    <main className="app">
      <h1 className="app-title">カレンダー日記</h1>

      <Calendar
        year={year}
        month={month}
        entryCounts={entryCounts}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      <DayEntryList
        date={selectedDate}
        entries={entriesByDate[selectedDate] ?? []}
        isLoading={isLoading}
      />
    </main>
  );
}

export default App;
