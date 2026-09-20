import './DayEntryList.css';

function DayEntryList({ date, entries, isLoading }) {
  return (
    <section className="day-entry-list">
      <h2 className="day-entry-list-title">{date}</h2>

      {isLoading ? (
        <p className="day-entry-list-message">読み込み中...</p>
      ) : entries.length === 0 ? (
        <p className="day-entry-list-message">この日の日記はまだありません</p>
      ) : (
        <ul className="day-entry-list-items">
          {entries.map((entry) => (
            <li key={entry.id} className="day-entry-list-item">
              {entry.title || '(無題)'}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DayEntryList;
