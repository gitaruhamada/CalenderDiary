# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際にClaude Code（claude.ai/code）に向けたガイダンスを提供します。

## プロジェクトの状態

Vite + React の雛形（フェーズ0）、IndexedDB データ層（フェーズ1、`src/db/`）、カレンダー画面（フェーズ2）、日記のCRUD UI（フェーズ3）、画像添付（フェーズ4）、タグ・検索・月間一覧（フェーズ5、`SearchView.jsx`/`MonthListView.jsx`/`TagInput.jsx`）が実装済み。フェーズ6（エクスポート/インポート・仕上げ）以降は未着手。進捗の詳細は `roadmap.md` を参照。

## よく使うコマンド

- `npm install` — 依存パッケージのインストール
- `npm run dev` — 開発サーバー起動
- `npm run build` — 本番ビルド（`dist/` に出力、Gitでは無視）
- `npm run lint` — oxlintによるlint
- `npm run preview` — ビルド成果物のプレビュー
- `npm run test` — vitestでテストを一括実行
- `npx vitest run src/db/entries.test.js` — 単一のテストファイルのみ実行
- `npx vitest run -t "テスト名の一部"` — 名前でテストを絞り込んで実行

テストにはvitestを使用し、ブラウザのIndexedDBはテスト環境で使えないため`fake-indexeddb`でモックしている（`src/db/entries.test.js`参照）。

## ディレクトリ構成

- `src/` — アプリケーション本体（Viteのデフォルト構成）
- `src/db/` — IndexedDBラッパー・CRUD関数（実装済み。`database.js`が接続管理、`entries.js`がCRUD、`entries.test.js`がテスト）
- `src/components/` — UIコンポーネント（`Calendar`、`DayEntryList`、`EntryForm`、`EntryDetail`、`ImagePicker`、`TagInput`、`SearchView`、`MonthListView`）
- `src/hooks/` — `useMonthEntries`（月間の日記データ取得・再取得）
- `src/utils/` — `calendarGrid`（カレンダーの日付グリッド計算、純粋関数）

## データ層（`src/db/`）の設計メモ

- IndexedDBのDB名は`carender-diary`、オブジェクトストア名は`entries`（`database.js`の定数を参照）。
- インデックス: `date`（範囲検索用、非ユニーク）、`tags`（`multiEntry`、将来のタグ絞り込み用）。
- 画像はBase64ではなく`Blob`のままエントリオブジェクトに埋め込んで保存する（IndexedDBは構造化複製でBlobを直接保存できるため）。
- `openDatabase()`は接続をモジュール内にキャッシュするシングルトン。テストで独立した状態が必要な場合は`closeDatabaseConnection()`で明示的に接続を閉じてから`indexedDB.deleteDatabase()`すること（接続を閉じずに削除しようとすると`blocked`状態でハングする）。

## 画面構成（`App.jsx`）

- `screen`状態で3画面を切り替え: `calendar`（カレンダー＋日記CRUD、既定）／`monthList`（月間一覧）／`search`（キーワード・タグ・日付範囲検索）。
- `panel`状態（`list`/`create`/`view`/`edit`）はカレンダー画面内での日記表示モード。
- 検索結果・月間一覧の項目クリックは`goToEntry(date, entryId)`でカレンダー画面のその日の詳細表示に遷移する。

## UI実装の注意点

- 画像プレビュー用の`URL.createObjectURL()`は、生成と`URL.revokeObjectURL()`による破棄を必ず同じ`useEffect`内で対にすること（`ImagePicker.jsx`/`EntryDetail.jsx`参照）。`useMemo`で生成すると、開発時の`StrictMode`によるエフェクト二重実行でクリーンアップが即座にURLを失効させ、`<img>`が読み込む前に`blob:`が壊れる（実際に発生した不具合）。

## このプロジェクトについて

カレンダー機能付きの個人用日記Webアプリ。詳細な仕様はユーザーとの要件ヒアリングを通じて作成され、`requirements.md` に記載されている。機能・スコープ・アーキテクチャに関する判断を行う前に必ず同ファイルを確認すること。すでに記録されている決定事項を再検討したり推測し直したりしないこと。

## 既に確定しているアーキテクチャ上の決定事項

以下は確定済みの事項であり（詳細な理由は`requirements.md`を参照）、ユーザーの指示なしに再検討しないこと。

- **フロントエンドのみで、バックエンド・サーバーは持たない。** すべてのデータはクライアント側に保持され、設計・実装すべきAPIは存在しない。
- **フレームワーク: React**（Viteなどのビルドツールの使用を想定しているが、まだ選定・セットアップされていない）。
- **データ保存先: localStorageではなくブラウザのIndexedDB。** 日記エントリには画像添付が含まれるため、ストレージの肥大化を避けるべくBase64文字列ではなくBlobとしてIndexedDBに保存する方針を採用している。
- **データモデル**: 日記エントリは `id`、`date`（YYYY-MM-DD形式）、`title`（任意）、`body`（必須）、`images`（Blob配列、1エントリ最大5枚）、`tags`（文字列配列）、`createdAt`、`updatedAt` を持つ。
- **同一日付に複数のエントリを登録可能** — `date` は一意キーではない。同じ日のエントリは `createdAt` 順に並べる。
- **単一ユーザー・単一ブラウザ／端末を前提とした設計。** アカウント機能・ログイン・複数端末間の同期・サーバーコンポーネントは持たない。気分・天気の記録、暗号化、PWAによるオフライン対応は本バージョンでは明示的にスコープ外（対象外・将来拡張の一覧は `requirements.md` の §5.2、§10 を参照）。

## 参照先

- `requirements.md` — 完全な要件定義書。機能スコープ、画面一覧、データモデル、非機能要件（パフォーマンス、レスポンシブ対応、バックアップ/エクスポート）、未確定事項などを含む。
