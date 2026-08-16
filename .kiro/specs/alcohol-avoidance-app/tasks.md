# 実装計画: Alcoholic Guard

## 概要

飲酒衝動を感じたユーザーに代替行動を提示し、タイマーで行動を促し、結果を記録するExpo/React Native/TypeScriptモバイルアプリケーションを実装する。オフラインファーストでstorage.tsモジュールによるシンプルなデータ層を採用し、将来のクラウド同期に対応可能な構造とする。MVPは1〜2時間で完成を目標とし、過剰設計を避ける。

## タスク

- [ ] 1. プロジェクト構造とコアインターフェースのセットアップ
  - [x] 1.1 Expoプロジェクトの初期化とディレクトリ構成の作成
    - Expo managed workflowでTypeScriptテンプレートを使用してプロジェクト `alcoholic-guard` を初期化する
    - `app/`（Expo Router画面）、`src/models/`、`src/contexts/`、`src/hooks/`、`src/constants/`、`src/utils/`、`src/components/`、`__tests__/properties/`、`__tests__/unit/` のディレクトリ構成を作成する
    - `expo-router`、`expo-haptics`、`@react-native-async-storage/async-storage` の依存パッケージをインストールする
    - _要件: 6.4, 6.5_

  - [x] 1.2 TypeScriptインターフェースとデータモデルの定義
    - `src/models/types.ts` に `CategoryId`、`AvoidanceCandidate`、`TimerDuration`、`TimerState`、`SessionResult`、`SessionAttempt`、`AvoidanceSession` の型定義を作成する
    - _要件: 5.1, 5.2_

  - [x] 1.3 プリセット回避候補データの定義
    - `src/constants/presets.ts` に `PRESET_CANDIDATES` 配列を定義する
    - 8カテゴリ（運動、食事、リラックス、娯楽、外出、人とつながる、お金を使わない、すぐできる）すべてのプリセット15件を含める
    - 各カテゴリに最低2つ以上の候補が含まれることを保証する
    - 1つの候補が複数カテゴリに属するデータ構造を設定する
    - _要件: 2.2, 2.3, 2.4, 2.5_

  - [~] 1.4 テスティングフレームワークのセットアップ
    - Jestと`fast-check`をdev dependencyとしてインストールする
    - `jest.config.ts` を設定し、TypeScript対応とパス解決を構成する
    - テストファイルのサンプルを作成して動作確認する
    - _要件: なし（テスト基盤）_

- [ ] 2. ストレージモジュールの実装
  - [~] 2.1 storage.tsの実装
    - `src/storage.ts` にAsyncStorage操作をまとめたシンプルなモジュールを作成する
    - `addSession(session)`: 既存配列にセッションを追加して保存
    - `loadSessions()`: 全セッションを読み込んで返す
    - ストレージキー `@alcoholic_guard/sessions` を使用する
    - try-catchでエラーをキャッチし、呼び出し元にthrowする
    - Repository PatternやInterface定義は行わない
    - _要件: 5.1, 5.2, 5.4_

  - [ ]\* 2.2 storage.tsのユニットテスト作成
    - `__tests__/unit/storage.test.ts` にAsyncStorageをモックしたテストを作成する
    - 保存、読み込み、エラーハンドリング（保存失敗時）のケースをテストする
    - _要件: 5.1, 5.4_

- [ ] 3. ユーティリティ関数の実装
  - [~] 3.1 タイマーフォーマット関数の実装
    - `src/utils/timer.ts` に `formatTimer(remainingSeconds: number): string` を実装する
    - 残り秒数をMM:SS形式にフォーマットする
    - 0パディングを適用する
    - _要件: 3.6_

  - [ ]\* 3.2 タイマーフォーマットのプロパティテスト作成
    - `__tests__/properties/timer.property.test.ts` を作成する
    - **Property 3: タイマーフォーマットの正確性**
    - **検証: 要件 3.6**
    - 任意の0以上の整数に対して`/^\d{2}:\d{2}$/`形式であること、パースすると元の秒数と等しいことを検証する

  - [~] 3.3 カテゴリフィルタリング関数の実装
    - `src/utils/candidates.ts` に `filterByCategory(candidates, categoryId)` を実装する
    - 指定カテゴリに属する候補のみを返す
    - _要件: 2.1, 2.7_

  - [~] 3.4 試行済み候補除外関数の実装
    - `src/utils/candidates.ts` に `excludeTriedCandidates(candidates, triedActionIds)` を実装する
    - 試行済みIDリストに含まれる候補を除外して返す
    - 未試行候補が0件の場合は全候補をリセット（除外なし）して返す
    - _要件: 4.3, 4.4_

  - [ ]\* 3.5 候補フィルタリングのプロパティテスト作成
    - `__tests__/properties/candidates.property.test.ts` を作成する
    - **Property 1: カテゴリ最小サイズ** — 各カテゴリに最低2つ以上の候補が存在すること
    - **Property 2: 複数カテゴリ所属** — 複数カテゴリに属する候補がすべてのカテゴリの結果に出現すること
    - **Property 4: 試行済み候補の除外** — 返り値にtriedActionIdsの候補が含まれないこと
    - **検証: 要件 2.3, 2.5, 4.3**

  - [~] 3.6 自由入力バリデーション関数の実装
    - `src/utils/validation.ts` に `validateFreeInput(input: string): boolean` を実装する
    - `input.trim().length > 0` かつ `input.length <= 50` の場合のみ `true` を返す
    - _要件: 7.3, 7.4_

  - [ ]\* 3.7 自由入力バリデーションのプロパティテスト作成
    - `__tests__/properties/validation.property.test.ts` を作成する
    - **Property 8: 自由入力バリデーション**
    - **検証: 要件 7.3, 7.4, 7.5**
    - 空文字・スペースのみ → false、1〜50文字のtrimmed非空文字 → true、51文字以上 → false を検証する

  - [~] 3.8 セッション記録作成関数の実装
    - `src/utils/session.ts` に `createSession(sessionId, startedAt, attempts, finalResult): AvoidanceSession` を実装する
    - UUID生成は `Date.now().toString(36) + Math.random().toString(36).slice(2)` で簡易的に行う
    - `totalDurationSeconds` を全試行の `actualDurationSeconds` 合計で算出する
    - `completedAt` を現在のISO 8601タイムスタンプで設定する
    - _要件: 5.1, 5.3_

  - [ ]\* 3.9 セッション記録のプロパティテスト作成
    - `__tests__/properties/session.property.test.ts` を作成する
    - **Property 5: セッション記録の完全性** — 必須フィールドがすべて存在すること
    - **Property 6: シリアライゼーションラウンドトリップ** — JSON.parse(JSON.stringify(session)) が元と等価であること
    - **Property 7: 複数試行のセッション集約** — attempts配列の長さが試行回数と等しいこと
    - **検証: 要件 4.2, 5.1, 5.2, 5.3**

  - [~] 3.10 次の行動提案関数の実装
    - `src/utils/suggestion.ts` に `suggestNextAction(lastActionId: string, candidates: AvoidanceCandidate[]): AvoidanceCandidate` を実装する
    - lastActionIdと異なるIDの候補からランダムに1件を返す
    - _要件: 8.1, 8.2_

- [~] 4. チェックポイント - ユーティリティ関数とデータ層の確認
  - すべてのテストがパスすることを確認し、質問がある場合はユーザーに確認する。

- [ ] 5. 状態管理の実装
  - [~] 5.1 SessionContextの実装
    - `src/contexts/SessionContext.tsx` に `SessionProvider` と `useSession` フックを実装する
    - `startSession`: 新しいセッションIDとstartedAtを生成して状態を初期化する
    - `addAttempt`: attemptsにSessionAttemptを追加し、triedActionIdsを更新する
    - `completeSession`: 最終結果を設定しstorage.tsのaddSession()を直接呼び出して保存する
    - `resetSession`: セッション状態をnullにリセットする
    - _要件: 4.2, 4.3, 5.1, 5.3_

  - [~] 5.2 useTimerカスタムフックの実装
    - `src/hooks/useTimer.ts` に絶対時刻ベースのタイマーフックを実装する
    - `Date.now()` ベースで残り時間を計算する方式を採用する
    - `AppState` イベントでフォアグラウンド復帰時に残り時間を再計算する
    - 1秒ごとの `setInterval` でUI再描画を行う
    - タイマー完了時のコールバックを提供する
    - _要件: 3.6, 3.7_

  - [~] 5.3 useCandidatesカスタムフックの実装
    - `src/hooks/useCandidates.ts` にフィルタリングフックを実装する
    - `filterByCategory` と `excludeTriedCandidates` ユーティリティを組み合わせる
    - カテゴリ選択状態と試行済みアクションIDを受け取り、フィルタ済み候補リストを返す
    - _要件: 2.1, 4.3, 4.4_

- [x] 6. UI画面の実装 - ホーム画面
  - [x] 6.1 Root Layoutの実装
    - `app/_layout.tsx` に `SessionProvider` でラップしたRoot Layoutを実装する
    - ErrorBoundaryを追加してクラッシュを防止する
    - Expo Routerのスタックナビゲーションを設定する
    - _要件: 6.4_

  - [x] 6.2 ホーム画面の実装
    - `app/index.tsx` にホーム画面を実装する
    - 「今、飲みたい」ボタンを画面の垂直方向中央以上の位置に配置する
    - ボタンサイズ: 幅60%以上、高さ48dp以上
    - タップ時に `startSession()` を呼び出し、`/candidates` に遷移する
    - ボタンが他の要素に隠されず常にタップ可能であることを保証する
    - _要件: 1.1, 1.2, 1.3, 1.5, 6.1_

- [ ] 7. UI画面の実装 - 回避候補一覧画面
  - [x] 7.1 カテゴリタブコンポーネントの実装
    - `src/components/CategoryTabs.tsx` に横スクロール可能なカテゴリフィルタを実装する
    - 「すべて」+ 8カテゴリのタブを表示する
    - 選択状態を視覚的にフィードバックする
    - _要件: 2.7_

  - [x] 7.2 候補カードとグリッドの実装
    - `src/components/CandidateCard.tsx` に個別候補カードを実装する
    - `src/components/CandidateGrid.tsx` にスクロールなしで6個以上表示可能なグリッドレイアウトを実装する
    - _要件: 2.6_

  - [x] 7.3 回避候補一覧画面の実装
    - `app/candidates.tsx` に回避候補一覧画面を実装する
    - `CategoryTabs` でカテゴリフィルタを表示する
    - `CandidateGrid` でフィルタ済み候補を表示する
    - 候補タップ時にセッションに記録し `/action` に遷移する
    - 自由入力候補選択時にはモーダルを表示する
    - _要件: 2.1, 2.6, 2.7, 2.8, 6.1, 6.2_

  - [~] 7.4 自由入力モーダルの実装
    - `src/components/FreeInputModal.tsx` にテキスト入力モーダルを実装する
    - 最大50文字の制限を表示する
    - `validateFreeInput` を使ってバリデーションする
    - 空文字・スペースのみの場合はエラーメッセージを表示して確定を拒否する
    - 確定時に入力内容を回避行動として `/action` に遷移する
    - _要件: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. UI画面の実装 - 「これをやる」画面（タイマー）
  - [~] 8.1 「これをやる」画面の実装
    - `app/action.tsx` にタイマー画面を実装する
    - 選択された回避行動名を画面上部に大きなフォントで表示する
    - タイマー選択肢（5分、10分、20分、30分）をボタンで表示する（デフォルト: 10分）
    - 「スタート」ボタンを表示する
    - スタートタップで `useTimer` を起動し、残り時間をMM:SS形式で表示する
    - タイマー動作中に「早期完了」ボタンを表示する
    - タイマー完了時に `expo-haptics` で振動フィードバックを実行する
    - タイマー完了または早期完了時に `/result` に遷移する
    - _要件: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 9. UI画面の実装 - 結果記録画面
  - [~] 9.1 結果記録画面の実装
    - `app/result.tsx` に結果記録画面を実装する
    - 「飲まずに済んだ」と「まだ飲みたい」の2つの選択肢を表示する
    - 「飲まずに済んだ」選択時: `completeSession('avoided')` で記録を保存し、「次にやること」を1件表示してからホーム画面に戻れるようにする
    - `suggestNextAction()` を使って直前の行動と異なる候補を1件ランダム表示する
    - 「ホームに戻る」ボタンを表示する
    - 「まだ飲みたい」選択時: `addAttempt` で試行を記録し、試行済み候補を除外した `/candidates` に遷移する
    - 戻る操作時: 記録を保存せずにホーム画面に戻る
    - _要件: 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4_

- [~] 10. チェックポイント - 全画面フローの確認
  - すべてのテストがパスすることを確認し、質問がある場合はユーザーに確認する。

- [ ] 11. エラーハンドリングと仕上げ
  - [~] 11.1 エラーハンドリングの実装
    - ホーム画面読み込みエラー時のエラーメッセージと再試行ボタンを実装する
    - ストレージ保存失敗時のSnackbar/Toastメッセージと再試行ボタンを実装する
    - 入力バリデーションエラーのインラインメッセージを実装する
    - _要件: 1.4, 5.4_

  - [~] 11.2 画面遷移パフォーマンスの確認と調整
    - 全画面遷移が500ミリ秒以内に完了することを確認する
    - 必要に応じてアニメーション設定を調整する
    - _要件: 1.3, 2.1, 6.2_

  - [ ]\* 11.3 インテグレーションテストの作成
    - `__tests__/integration/session-flow.test.ts` を作成する
    - ホーム → 候補選択 → タイマー → 結果記録 → ホームの一連のフローをテストする
    - 「まだ飲みたい」→ 候補除外 → 再選択のフローをテストする
    - _要件: 4.1, 4.2, 4.3, 6.1_

- [~] 12. 最終チェックポイント - 全テストパスの確認
  - すべてのテストがパスすることを確認し、質問がある場合はユーザーに確認する。

## ノート

- `*` マーク付きのタスクはオプションであり、MVPの高速リリースのためにスキップ可能
- 各タスクは特定の要件への追跡可能性を持つ
- チェックポイントで段階的な検証を行う
- プロパティテストは普遍的な正確性プロパティを検証する
- ユニットテストは具体的なシナリオとエッジケースを検証する
- TypeScript + Expo Router + AsyncStorageの技術スタックで実装する
- MVPではRepository Pattern、Interface定義、スキーマバージョニングは実装しない
- storage.tsの差し替えで将来のSupabase連携に対応可能

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "3.1", "3.3", "3.4", "3.6", "3.8", "3.10"] },
    { "id": 3, "tasks": ["2.2", "3.2", "3.5", "3.7", "3.9"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["6.2", "7.1", "7.2"] },
    { "id": 7, "tasks": ["7.3", "7.4"] },
    { "id": 8, "tasks": ["8.1"] },
    { "id": 9, "tasks": ["9.1"] },
    { "id": 10, "tasks": ["11.1", "11.2"] },
    { "id": 11, "tasks": ["11.3"] }
  ]
}
```
