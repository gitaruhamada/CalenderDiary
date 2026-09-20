import './EntryDetail.css';

function EntryDetail({ entry, onEdit, onDelete, onBack }) {
  return (
    <div className="entry-detail">
      <button type="button" className="entry-detail-back" onClick={onBack}>
        ← 一覧に戻る
      </button>

      <h3 className="entry-detail-title">{entry.title || '(無題)'}</h3>
      <p className="entry-detail-body">{entry.body}</p>

      <div className="entry-detail-actions">
        <button type="button" onClick={onEdit}>
          編集
        </button>
        <button type="button" className="entry-detail-delete" onClick={onDelete}>
          削除
        </button>
      </div>
    </div>
  );
}

export default EntryDetail;
