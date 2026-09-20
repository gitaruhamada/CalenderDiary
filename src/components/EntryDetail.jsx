import { useEffect, useState } from 'react';
import './EntryDetail.css';

function EntryDetail({ entry, onEdit, onDelete, onBack }) {
  const [imageUrls, setImageUrls] = useState([]);
  const [enlargedIndex, setEnlargedIndex] = useState(null);

  // オブジェクトURLの生成・破棄は必ずuseEffect内で対にする（ImagePicker.jsx参照、
  // StrictModeの二重実行でblob:が壊れる不具合の回避）。
  useEffect(() => {
    const urls = entry.images.map((image) => URL.createObjectURL(image));
    setImageUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [entry.images]);

  return (
    <div className="entry-detail">
      <button type="button" className="entry-detail-back" onClick={onBack}>
        ← 一覧に戻る
      </button>

      <h3 className="entry-detail-title">{entry.title || '(無題)'}</h3>
      <p className="entry-detail-body">{entry.body}</p>

      {imageUrls.length > 0 && (
        <div className="entry-detail-images">
          {imageUrls.map((url, index) => (
            <button
              type="button"
              key={url}
              className="entry-detail-thumb"
              onClick={() => setEnlargedIndex(index)}
            >
              <img src={url} alt={`添付画像${index + 1}`} />
            </button>
          ))}
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="entry-detail-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="entry-detail-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="entry-detail-actions">
        <button type="button" onClick={onEdit}>
          編集
        </button>
        <button type="button" className="entry-detail-delete" onClick={onDelete}>
          削除
        </button>
      </div>

      {enlargedIndex !== null && (
        <div className="entry-detail-lightbox" onClick={() => setEnlargedIndex(null)}>
          <img src={imageUrls[enlargedIndex]} alt={`添付画像${enlargedIndex + 1}拡大表示`} />
        </div>
      )}
    </div>
  );
}

export default EntryDetail;
