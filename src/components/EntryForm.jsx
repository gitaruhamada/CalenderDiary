import { useState } from 'react';
import './EntryForm.css';

function EntryForm({ initialTitle = '', initialBody = '', submitLabel, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!body.trim()) {
      setError('本文を入力してください');
      return;
    }

    onSubmit({ title, body });
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
