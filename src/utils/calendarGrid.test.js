import { describe, expect, it } from 'vitest';
import { formatDateKey, getMonthGrid, getTodayKey, WEEKDAYS } from './calendarGrid.js';

describe('getMonthGrid', () => {
  it('月の最初と最後の日付をすべて含み、7列のグリッドになる', () => {
    const weeks = getMonthGrid(2026, 8); // 2026年9月(月は0始まり)
    const flat = weeks.flat();

    expect(flat.length % 7).toBe(0);
    weeks.forEach((week) => expect(week).toHaveLength(7));

    const nonNullDays = flat.filter((d) => d !== null);
    expect(nonNullDays).toHaveLength(30);
    expect(nonNullDays[0]).toBe('2026-09-01');
    expect(nonNullDays[nonNullDays.length - 1]).toBe('2026-09-30');
  });

  it('先頭の空白セル数は月初の曜日と一致する', () => {
    const year = 2026;
    const month = 8;
    const flat = getMonthGrid(year, month).flat();
    const leadingBlanks = flat.findIndex((d) => d !== null);

    expect(leadingBlanks).toBe(new Date(year, month, 1).getDay());
  });

  it('うるう年の2月も正しく29日まで含む', () => {
    const flat = getMonthGrid(2028, 1).flat(); // 2028年2月(うるう年)
    const nonNullDays = flat.filter((d) => d !== null);

    expect(nonNullDays).toHaveLength(29);
    expect(nonNullDays[nonNullDays.length - 1]).toBe('2028-02-29');
  });
});

describe('formatDateKey', () => {
  it('YYYY-MM-DD形式で月日がゼロ埋めされる', () => {
    expect(formatDateKey(2026, 0, 5)).toBe('2026-01-05');
  });
});

describe('getTodayKey', () => {
  it('YYYY-MM-DD形式の文字列を返す', () => {
    expect(getTodayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('WEEKDAYS', () => {
  it('日曜始まりで7要素の配列', () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS[0]).toBe('日');
    expect(WEEKDAYS[6]).toBe('土');
  });
});
