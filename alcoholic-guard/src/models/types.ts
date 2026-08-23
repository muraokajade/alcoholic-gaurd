// === 回避候補 ===

export type CategoryId =
  | "exercise" // 運動
  | "food" // 食事
  | "relax" // リラックス
  | "entertainment" // 娯楽
  | "going-out" // 外出
  | "connect" // 人とつながる
  | "free" // お金を使わない
  | "quick"; // すぐできる

export interface AvoidanceCandidate {
  id: string;
  label: string;
  categories: CategoryId[];
  isPreset: boolean;
}

// === タイマー ===

export type TimerDuration = 300 | 600 | 1200 | 1800; // 5, 10, 20, 30分（秒）

export interface TimerState {
  duration: TimerDuration;
  remainingSeconds: number;
  isRunning: boolean;
  startedAt: string | null; // ISO 8601
}

// === セッション ===

export type SessionResult = "avoided" | "still-craving";

export interface SessionAttempt {
  actionId: string;
  actionLabel: string;
  timerDuration: TimerDuration;
  actualDurationSeconds: number;
  completedAt: string; // ISO 8601
  result: SessionResult;
}

export interface AvoidanceSession {
  sessionId: string;
  startedAt: string; // ISO 8601
  cravingTriggered: boolean;
  attempts: SessionAttempt[];
  finalResult: SessionResult;
  totalDurationSeconds: number;
  completedAt: string; // ISO 8601
}

// === Alcohol Guard v0 ===

export interface AlcoholGuardRecord {
  id: string;
  urgeLevel: number; // 0-10
  states: string[]; // e.g. ['つらい', '疲労']
  nextAction: string; // e.g. '散歩する'
  memo: string;
  createdAt: string; // ISO 8601
}

// === v1: ゴール ===

// "20:00" / "21:00" 形式。将来的な拡張のため任意の "HH:mm" 文字列を許容する。
export type GoalTime = string;

export const GOAL_TIME_OPTIONS: GoalTime[] = ['20:00', '21:00'];

// === v1: 朝チェックイン ===

export interface MorningCheckin {
  date: string; // YYYY-MM-DD
  mood: number; // 気分 0-10
  lightness: number; // 体の軽さ 0-10
  refreshment: number; // 爽快感 0-10
  urge: number; // 飲酒欲求 0-10
  goalTime: GoalTime;
  createdAt: string; // ISO 8601
}

// === v1: 一日の状態（朝チェックイン + 夜の結果） ===

export interface DailyStatus {
  date: string; // YYYY-MM-DD
  checkin: MorningCheckin | null;
  drank: boolean;
  achieved: boolean; // ゴール時刻まで買わず/飲まずに到達したか
  moneySaved: number; // その日守った金額
  guardActionCount: number; // その日実行した代替行動の回数
  finalizedAt: string | null; // 達成/確定を記録した時刻
}

// === v1: 代替行動 ===

export type ActionCategoryId =
  | 'body' // 身体を切り替える
  | 'food' // 飲食
  | 'environment' // 環境を変える
  | 'mind' // 手・頭を使う
  | 'reward'; // 報酬・人との接触

export interface AlternativeAction {
  id: string;
  label: string;
  category: ActionCategoryId;
  isCustom: boolean;
  rewardId?: string; // 紐づくご褒美（任意）
}

export interface Reward {
  id: string;
  label: string;
  isCustom: boolean;
}

export interface ActionLogEntry {
  id: string;
  actionId: string;
  actionLabel: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601
}

// === v1: 設定 ===

export interface AppSettings {
  dailyAlcoholCost: number; // 普段1日に酒へ使う金額（円）
  totalMoneySaved: number; // 累計で守った金額
}

// === v1: AI朝チェックイン（交換可能なサービス境界） ===

export interface AiCheckinRequest {
  mood: number;
  lightness: number;
  refreshment: number;
  urge: number;
  yesterdayDrank: boolean;
}

export interface AiCheckinResponse {
  summary: string; // 今日の状態整理
  situationNotes: string; // 飲酒につながりそうな状況の整理
  suggestedActionIds: string[]; // 今日使えそうな代替行動
}

// === v1.1: 予防行動（飲酒につながる前に行う） ===
// 代替行動（飲酒欲求が出た"あと"にも使える）とは別概念。
// 予防行動は飲酒欲求が強くなる"前"に先回りして行うもの。

export interface PreventionAction {
  id: string;
  label: string;
  isCustom: boolean;
  rewardId?: string; // 紐づくご褒美（任意）
}

export interface PreventionPlanItem {
  actionId: string;
  actionLabel: string;
  scheduledTime?: string; // "HH:mm" 任意
  rewardId?: string; // その日だけのご褒美上書き（任意）
  done: boolean;
  doneAt: string | null; // ISO 8601
}

// 1日分の予防ガード計画。最大3個程度を想定するが強制はしない（0〜数個）。
export interface PreventionPlan {
  date: string; // YYYY-MM-DD
  items: PreventionPlanItem[];
}
