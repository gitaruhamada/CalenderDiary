import { useState } from 'react';
import Calendar from './components/Calendar.jsx';
import DataManagementView from './components/DataManagementView.jsx';
import DayEntryList from './components/DayEntryList.jsx';
import EntryDetail from './components/EntryDetail.jsx';
import EntryForm from './components/EntryForm.jsx';
import MonthListView from './components/MonthListView.jsx';
import SearchView from './components/SearchView.jsx';
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
  const [screen, setScreen] = useState('calendar');
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

  async function handleCreate({ title, body, images, tags }) {
    await addEntry({ date: selectedDate, title, body, images, tags });
    await refresh();
    setPanel({ mode: 'list' });
  }

  async function handleUpdate(entryId, { title, body, images, tags }) {
    await updateEntry(entryId, { title, body, images, tags });
    await refresh();
    setPanel({ mode: 'view', entryId });
  }

  async function handleDelete(entryId) {
    if (!window.confirm('この日記を削除しますか？')) return;
    await deleteEntry(entryId);
    await refresh();
    setPanel({ mode: 'list' });
  }

  function goToEntry(date, entryId) {
    const [entryYear, entryMonth] = date.split('-').map(Number);
    setYearMonth({ year: entryYear, month: entryMonth - 1 });
    setSelectedDate(date);
    setPanel({ mode: 'view', entryId });
    setScreen('calendar');
  }

  const entryCounts = Object.fromEntries(
    Object.entries(entriesByDate).map(([date, entries]) => [date, entries.length])
  );

  return (
    <main className="app">
      <h1 className="app-title">カレンダー日記</h1>

      <nav className="app-nav">
        <button
          type="button"
          className={screen === 'calendar' ? 'app-nav-active' : ''}
          onClick={() => setScreen('calendar')}
        >
          カレンダー
        </button>
        <button
          type="button"
          className={screen === 'monthList' ? 'app-nav-active' : ''}
          onClick={() => setScreen('monthList')}
        >
          月間一覧
        </button>
        <button
          type="button"
          className={screen === 'search' ? 'app-nav-active' : ''}
          onClick={() => setScreen('search')}
        >
          検索
        </button>
        <button
          type="button"
          className={screen === 'data' ? 'app-nav-active' : ''}
          onClick={() => setScreen('data')}
        >
          データ管理
        </button>
      </nav>

      {screen === 'calendar' && (
        <>
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
              initialTags={activeEntry.tags}
              onSubmit={(values) => handleUpdate(activeEntry.id, values)}
              onCancel={() => setPanel({ mode: 'view', entryId: activeEntry.id })}
            />
          )}
        </>
      )}

      {screen === 'monthList' && (
        <MonthListView
          year={year}
          month={month}
          entriesByDate={entriesByDate}
          onSelectEntry={goToEntry}
          onBack={() => setScreen('calendar')}
        />
      )}

      {screen === 'search' && (
        <SearchView
          onSelectResult={(entry) => goToEntry(entry.date, entry.id)}
          onBack={() => setScreen('calendar')}
        />
      )}

      {screen === 'data' && (
        <DataManagementView onBack={() => setScreen('calendar')} onImported={refresh} />
      )}
    </main>
  );
}

export default App;
