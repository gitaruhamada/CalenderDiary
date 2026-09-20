import { useEffect, useState } from 'react';
import { getEntriesByDateRange } from '../db/entries.js';

function getMonthRange(year, month) {
  const mm = String(month + 1).padStart(2, '0');
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

function groupByDate(entries) {
  const grouped = {};
  for (const entry of entries) {
    if (!grouped[entry.date]) {
      grouped[entry.date] = [];
    }
    grouped[entry.date].push(entry);
  }
  return grouped;
}

function useMonthEntries(year, month) {
  const [loaded, setLoaded] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const { start, end } = getMonthRange(year, month);
    getEntriesByDateRange(start, end).then((entries) => {
      if (cancelled) return;
      setLoaded({ year, month, entriesByDate: groupByDate(entries) });
    });

    return () => {
      cancelled = true;
    };
  }, [year, month, reloadToken]);

  const isCurrent = loaded !== null && loaded.year === year && loaded.month === month;

  return {
    entriesByDate: isCurrent ? loaded.entriesByDate : {},
    isLoading: !isCurrent,
    refresh: () => setReloadToken((token) => token + 1),
  };
}

export default useMonthEntries;
