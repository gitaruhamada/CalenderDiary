import { useEffect, useMemo, useState } from 'react';
import { getAllEntries } from '../db/entries.js';
import './SearchView.css';

function SearchView({ onSelectResult, onBack }) {
  const [allEntries, setAllEntries] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    getAllEntries().then(setAllEntries);
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    allEntries.forEach((entry) => entry.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [allEntries]);

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return allEntries
      .filter((entry) => {
        if (
          kw &&
          !entry.title.toLowerCase().includes(kw) &&
          !entry.body.toLowerCase().includes(kw)
        ) {
          return false;
        }
        if (selectedTag && !entry.tags.includes(selectedTag)) {
          return false;
        }
        if (startDate && entry.date < startDate) return false;
        if (endDate && entry.date > endDate) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [allEntries, keyword, selectedTag, startDate, endDate]);

  return (
    <section className="search-view">
      <button type="button" className="search-view-back" onClick={onBack}>
        ← カレンダーに戻る
      </button>

      <h2 className="search-view-title">検索</h2>

      <label className="search-view-field">
        <span>キーワード</span>
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="タイトル・本文を検索"
        />
      </label>

      <div className="search-view-field">
        <span>日付範囲</span>
        <div className="search-view-date-range">
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <span>〜</span>
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="search-view-field">
          <span>タグで絞り込み</span>
          <div className="search-view-tags">
            {allTags.map((tag) => (
              <button
                type="button"
                key={tag}
                className={
                  tag === selectedTag ? 'search-view-tag search-view-tag-active' : 'search-view-tag'
                }
                onClick={() => setSelectedTag((current) => (current === tag ? '' : tag))}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <p className="search-view-empty">該当する日記がありません</p>
      ) : (
        <ul className="search-view-results">
          {results.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className="search-view-result"
                onClick={() => onSelectResult(entry)}
              >
                <span className="search-view-result-date">{entry.date}</span>
                <span className="search-view-result-title">{entry.title || '(無題)'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SearchView;
