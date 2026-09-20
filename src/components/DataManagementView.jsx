import { useState } from 'react';
import { getAllEntries, importEntries } from '../db/entries.js';
import { blobToDataUrl, dataUrlToBlob } from '../utils/imageCodec.js';
import './DataManagementView.css';

const EXPORT_VERSION = 1;

function DataManagementView({ onBack, onImported }) {
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  async function handleExport() {
    setIsBusy(true);
    setStatus('');
    try {
      const entries = await getAllEntries();
      const serializable = await Promise.all(
        entries.map(async (entry) => ({
          ...entry,
          images: await Promise.all(entry.images.map(blobToDataUrl)),
        }))
      );
      const payload = JSON.stringify(
        { version: EXPORT_VERSION, exportedAt: new Date().toISOString(), entries: serializable },
        null,
        2
      );

      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carender-diary-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setStatus(`${entries.length}件の日記をエクスポートしました`);
    } catch (error) {
      setStatus(`エクスポートに失敗しました: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsBusy(true);
    setStatus('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.entries)) {
        throw new Error('ファイルの形式が正しくありません');
      }

      const entries = await Promise.all(
        data.entries.map(async (entry) => ({
          ...entry,
          images: await Promise.all((entry.images ?? []).map(dataUrlToBlob)),
        }))
      );

      await importEntries(entries);
      setStatus(`${entries.length}件の日記をインポートしました`);
      onImported?.();
    } catch (error) {
      setStatus(`インポートに失敗しました: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="data-management-view">
      <button type="button" className="data-management-back" onClick={onBack}>
        ← カレンダーに戻る
      </button>

      <h2 className="data-management-title">データ管理</h2>

      <div className="data-management-block">
        <h3>エクスポート</h3>
        <p>すべての日記をJSONファイルとして保存します。バックアップにご利用ください。</p>
        <button type="button" onClick={handleExport} disabled={isBusy}>
          JSONをエクスポート
        </button>
      </div>

      <div className="data-management-block">
        <h3>インポート</h3>
        <p>エクスポートしたJSONファイルから日記を復元します。同じIDの日記は上書きされます。</p>
        <label className="data-management-import-label">
          JSONファイルを選択
          <input
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            disabled={isBusy}
            hidden
          />
        </label>
      </div>

      {status && <p className="data-management-status">{status}</p>}
    </section>
  );
}

export default DataManagementView;
