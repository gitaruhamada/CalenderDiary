import { useState } from 'react';
import { MAX_IMAGES_PER_ENTRY } from '../db/entries.js';
import ImagePicker from './ImagePicker.jsx';
import TagInput from './TagInput.jsx';
import './EntryForm.css';

function EntryForm({
  initialTitle = '',
  initialBody = '',
  initialImages = [],
  initialTags = [],
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [images, setImages] = useState(initialImages);
  const [tags, setTags] = useState(initialTags);
  const [error, setError] = useState('');

  function handleAddImages(files) {
    setImages((current) => [...current, ...files]);
  }

  function handleRemoveImage(index) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!body.trim()) {
      setError('本文を入力してください');
      return;
    }

    onSubmit({ title, body, images, tags });
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <label className="entry-form-field">
        <span>タイトル（任意）</span>
        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label className="entry-form-field">
        <span>本文</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={6}
        />
      </label>

      <div className="entry-form-field">
        <span>画像（任意、最大{MAX_IMAGES_PER_ENTRY}枚）</span>
        <ImagePicker
          images={images}
          onAdd={handleAddImages}
          onRemove={handleRemoveImage}
          maxImages={MAX_IMAGES_PER_ENTRY}
        />
      </div>

      <div className="entry-form-field">
        <span>タグ（任意）</span>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {error && <p className="entry-form-error">{error}</p>}

      <div className="entry-form-actions">
        <button type="submit">{submitLabel}</button>
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </form>
  );
}

export default EntryForm;
