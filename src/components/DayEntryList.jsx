import './DayEntryList.css';

function DayEntryList({ date, entries, isLoading, onSelectEntry, onCreateNew }) {
  return (
    <section className="day-entry-list">
      <div className="day-entry-list-header">
        <h2 className="day-entry-list-title">{date}</h2>
        <button type="button" className="day-entry-list-add" onClick={onCreateNew}>
          ＋ 新規作成
        </button>
      </div>

      {isLoading ? (
        <p className="day-entry-list-message">読み込み中...</p>
      ) : entries.length === 0 ? (
        <p className="day-entry-list-message">この日の日記はまだありません</p>
      ) : (
        <ul className="day-entry-list-items">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className="day-entry-list-item"
                onClick={() => onSelectEntry(entry.id)}
              >
                {entry.title || '(無題)'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DayEntryList;
