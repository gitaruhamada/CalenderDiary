import { openDatabase, STORE_NAME } from './database.js';

export const MAX_IMAGES_PER_ENTRY = 5;

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function validateEntryInput({ body, images }) {
  if (!body || !body.trim()) {
    throw new Error('本文(body)は必須です');
  }
  if (images && images.length > MAX_IMAGES_PER_ENTRY) {
    throw new Error(`画像は1エントリあたり最大${MAX_IMAGES_PER_ENTRY}枚までです`);
  }
}

export async function addEntry({ date, title = '', body, images = [], tags = [] }) {
  validateEntryInput({ body, images });

  const now = new Date().toISOString();
  const entry = {
    id: crypto.randomUUID(),
    date,
    title,
    body,
    images,
    tags,
    createdAt: now,
    updatedAt: now,
  };

  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return entry;
}

export async function getEntry(id) {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readonly');
  return requestToPromise(tx.objectStore(STORE_NAME).get(id));
}

export async function getEntriesByDate(date) {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.objectStore(STORE_NAME).index('date');
  const entries = await requestToPromise(index.getAll(date));
  return entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getEntriesByDateRange(startDate, endDate) {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.objectStore(STORE_NAME).index('date');
  const range = IDBKeyRange.bound(startDate, endDate);
  const entries = await requestToPromise(index.getAll(range));
  return entries.sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
  );
}

export async function getAllEntries() {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readonly');
  return requestToPromise(tx.objectStore(STORE_NAME).getAll());
}

export async function updateEntry(id, changes) {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const existing = await requestToPromise(store.get(id));

  if (!existing) {
    throw new Error(`id=${id} の日記エントリが見つかりません`);
  }

  const updated = {
    ...existing,
    ...changes,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  validateEntryInput(updated);

  await new Promise((resolve, reject) => {
    const putReq = store.put(updated);
    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });

  return updated;
}

export async function deleteEntry(id) {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// インポート専用。同じIDのエントリは上書きするため、addEntryのadd()ではなくput()を使う。
export async function importEntries(entries) {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    entries.forEach((entry) => store.put(entry));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
