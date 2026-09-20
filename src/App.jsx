import { useState } from 'react';
import Calendar from './components/Calendar.jsx';
import DayEntryList from './components/DayEntryList.jsx';
import EntryDetail from './components/EntryDetail.jsx';
import EntryForm from './components/EntryForm.jsx';
import { addEntry, deleteEntry, updateEntry } from './db/entries.js';
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
  const [panel, setPanel] = useState({ mode: 'list' });
  const { entriesByDate, isLoading, refresh } = useMonthEntries(year, month);

  const entriesForSelectedDate = entriesByDate[selectedDate] ?? [];
  const activeEntry =
    panel.mode === 'view' || panel.mode === 'edit'
      ? entriesForSelectedDate.find((entry) => entry.id === panel.entryId)
      : null;

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

  function handleSelectDate(date) {
    setSelectedDate(date);
    setPanel({ mode: 'list' });
  }

  async function handleCreate({ title, body, images }) {
    await addEntry({ date: selectedDate, title, body, images });
    await refresh();
    setPanel({ mode: 'list' });
  }

  async function handleUpdate(entryId, { title, body, images }) {
    await updateEntry(entryId, { title, body, images });
    await refresh();
    setPanel({ mode: 'view', entryId });
  }

  async function handleDelete(entryId) {
    if (!window.confirm('この日記を削除しますか？')) return;
    await deleteEntry(entryId);
    await refresh();
    setPanel({ mode: 'list' });
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
        onSelectDate={handleSelectDate}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      {panel.mode === 'list' && (
        <DayEntryList
          date={selectedDate}
          entries={entriesForSelectedDate}
          isLoading={isLoading}
          onSelectEntry={(entryId) => setPanel({ mode: 'view', entryId })}
          onCreateNew={() => setPanel({ mode: 'create' })}
        />
      )}

      {panel.mode === 'create' && (
        <EntryForm
          submitLabel="作成"
          onSubmit={handleCreate}
          onCancel={() => setPanel({ mode: 'list' })}
        />
      )}

      {panel.mode === 'view' && activeEntry && (
        <EntryDetail
          entry={activeEntry}
          onEdit={() => setPanel({ mode: 'edit', entryId: activeEntry.id })}
          onDelete={() => handleDelete(activeEntry.id)}
          onBack={() => setPanel({ mode: 'list' })}
        />
      )}

      {panel.mode === 'edit' && activeEntry && (
        <EntryForm
          submitLabel="更新"
          initialTitle={activeEntry.title}
          initialBody={activeEntry.body}
          initialImages={activeEntry.images}
          onSubmit={(values) => handleUpdate(activeEntry.id, values)}
          onCancel={() => setPanel({ mode: 'view', entryId: activeEntry.id })}
        />
      )}
    </main>
  );
}

export default App;
