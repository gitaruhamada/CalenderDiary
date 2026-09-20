import './MonthListView.css';

function MonthListView({ year, month, entriesByDate, onSelectEntry, onBack }) {
  const dates = Object.keys(entriesByDate).sort();

  return (
    <section className="month-list-view">
      <button type="button" className="month-list-back" onClick={onBack}>
        ← カレンダーに戻る
      </button>

      <h2 className="month-list-title">
        {year}年{month + 1}月の日記一覧
      </h2>

      {dates.length === 0 ? (
        <p className="month-list-empty">この月の日記はまだありません</p>
      ) : (
        <ul className="month-list-items">
          {dates.map((date) =>
            entriesByDate[date].map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="month-list-item"
                  onClick={() => onSelectEntry(date, entry.id)}
                >
                  <span className="month-list-item-date">{date}</span>
                  <span className="month-list-item-title">{entry.title || '(無題)'}</span>
                  {entry.tags.length > 0 && (
                    <span className="month-list-item-tags">{entry.tags.join(', ')}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}

export default MonthListView;
