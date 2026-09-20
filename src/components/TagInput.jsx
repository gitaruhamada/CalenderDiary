import { useState } from 'react';
import './TagInput.css';

function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitDraft();
    } else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(index) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className="tag-input">
      {tags.map((tag, index) => (
        <span key={tag} className="tag-input-chip">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            aria-label={`タグ「${tag}」を削除`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        className="tag-input-field"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder="タグを入力してEnter"
      />
    </div>
  );
}

export default TagInput;
