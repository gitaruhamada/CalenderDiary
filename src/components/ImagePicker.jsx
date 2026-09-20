import { useEffect, useState } from 'react';
import './ImagePicker.css';

function ImagePicker({ images, onAdd, onRemove, maxImages }) {
  const [previewUrls, setPreviewUrls] = useState([]);

  // オブジェクトURLの生成・破棄は必ずuseEffect内で対にする。
  // useMemoで生成するとStrictModeの二重実行でエフェクトのクリーンアップがURLを
  // 即座に失効させ、<img>がblob:を読み込む前に壊れてしまう。
  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  function handleFileChange(event) {
    const files = Array.from(event.target.files ?? []);
    const remaining = maxImages - images.length;
    if (files.length > 0 && remaining > 0) {
      onAdd(files.slice(0, remaining));
    }
    event.target.value = '';
  }

  const canAddMore = images.length < maxImages;

  return (
    <div className="image-picker">
      {previewUrls.length > 0 && (
        <div className="image-picker-thumbs">
          {previewUrls.map((url, index) => (
            <div key={url} className="image-picker-thumb">
              <img src={url} alt={`添付画像${index + 1}`} />
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`添付画像${index + 1}を削除`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore ? (
        <label className="image-picker-add">
          ＋ 画像を追加（{images.length}/{maxImages}）
          <input type="file" accept="image/*" multiple onChange={handleFileChange} hidden />
        </label>
      ) : (
        <p className="image-picker-limit">画像は最大{maxImages}枚までです</p>
      )}
    </div>
  );
}

export default ImagePicker;
