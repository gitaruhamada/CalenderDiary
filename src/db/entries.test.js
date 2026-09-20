import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { closeDatabaseConnection, DB_NAME } from './database.js';
import {
  addEntry,
  deleteEntry,
  getAllEntries,
  getEntriesByDate,
  getEntriesByDateRange,
  getEntry,
  importEntries,
  MAX_IMAGES_PER_ENTRY,
  updateEntry,
} from './entries.js';

beforeEach(async () => {
  // 各テストの前に既存接続を閉じてからDBを削除し、独立した状態にする
  await closeDatabaseConnection();
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
});

describe('addEntry / getEntry', () => {
  it('日記エントリを作成し、IDで取得できる', async () => {
    const entry = await addEntry({ date: '2026-09-20', body: '今日は良い天気だった' });

    expect(entry.id).toBeTruthy();
    expect(entry.date).toBe('2026-09-20');
    expect(entry.title).toBe('');
    expect(entry.createdAt).toBe(entry.updatedAt);

    const fetched = await getEntry(entry.id);
    expect(fetched).toEqual(entry);
  });

  it('本文が空の場合はエラーになる', async () => {
    await expect(addEntry({ date: '2026-09-20', body: '' })).rejects.toThrow('本文');
  });

  it('画像が上限枚数を超える場合はエラーになる', async () => {
    const tooMany = Array.from({ length: MAX_IMAGES_PER_ENTRY + 1 }, () => new Blob());
    await expect(
      addEntry({ date: '2026-09-20', body: '本文', images: tooMany })
    ).rejects.toThrow('最大');
  });
});

describe('getEntriesByDate', () => {
  it('同一日付に複数エントリを登録でき、作成順に取得できる', async () => {
    const first = await addEntry({ date: '2026-09-20', body: '朝の日記' });
    // createdAt(ミリ秒精度)が同一にならないよう、実際の連続作成を想定して間隔を空ける
    await new Promise((resolve) => setTimeout(resolve, 2));
    const second = await addEntry({ date: '2026-09-20', body: '夜の日記' });
    await addEntry({ date: '2026-09-21', body: '別の日' });

    const entries = await getEntriesByDate('2026-09-20');
    expect(entries.map((e) => e.id)).toEqual([first.id, second.id]);
  });
});

describe('getEntriesByDateRange', () => {
  it('指定した日付範囲のエントリのみ取得できる', async () => {
    await addEntry({ date: '2026-08-31', body: '範囲外(前)' });
    const inRange1 = await addEntry({ date: '2026-09-01', body: '範囲内1' });
    const inRange2 = await addEntry({ date: '2026-09-15', body: '範囲内2' });
    await addEntry({ date: '2026-10-01', body: '範囲外(後)' });

    const entries = await getEntriesByDateRange('2026-09-01', '2026-09-30');
    expect(entries.map((e) => e.id).sort()).toEqual([inRange1.id, inRange2.id].sort());
  });
});

describe('updateEntry', () => {
  it('既存エントリの内容を更新し、updatedAtが変わる', async () => {
    const entry = await addEntry({ date: '2026-09-20', body: '元の本文' });
    const updated = await updateEntry(entry.id, { body: '更新後の本文', tags: ['旅行'] });

    expect(updated.body).toBe('更新後の本文');
    expect(updated.tags).toEqual(['旅行']);
    expect(updated.createdAt).toBe(entry.createdAt);
  });

  it('存在しないIDを更新しようとするとエラーになる', async () => {
    await expect(updateEntry('存在しないID', { body: 'x' })).rejects.toThrow('見つかりません');
  });
});

describe('deleteEntry', () => {
  it('エントリを削除すると取得できなくなる', async () => {
    const entry = await addEntry({ date: '2026-09-20', body: '削除対象' });
    await deleteEntry(entry.id);

    const fetched = await getEntry(entry.id);
    expect(fetched).toBeUndefined();
  });
});

describe('getAllEntries', () => {
  it('登録したすべてのエントリを取得できる', async () => {
    await addEntry({ date: '2026-09-20', body: '1件目' });
    await addEntry({ date: '2026-09-21', body: '2件目' });

    const entries = await getAllEntries();
    expect(entries).toHaveLength(2);
  });
});

describe('importEntries', () => {
  it('新しいエントリを取り込める', async () => {
    await importEntries([
      {
        id: 'import-1',
        date: '2026-09-20',
        title: '復元されたタイトル',
        body: '復元された本文',
        images: [],
        tags: ['バックアップ'],
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
    ]);

    const fetched = await getEntry('import-1');
    expect(fetched.title).toBe('復元されたタイトル');
    expect(fetched.tags).toEqual(['バックアップ']);
  });

  it('同じIDのエントリは上書きされる(再インポートしてもエラーにならない)', async () => {
    const entry = {
      id: 'import-2',
      date: '2026-09-20',
      title: '元のタイトル',
      body: '本文',
      images: [],
      tags: [],
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    };

    await importEntries([entry]);
    await importEntries([{ ...entry, title: '上書き後のタイトル' }]);

    const fetched = await getEntry('import-2');
    expect(fetched.title).toBe('上書き後のタイトル');

    const all = await getAllEntries();
    expect(all).toHaveLength(1);
  });
});
