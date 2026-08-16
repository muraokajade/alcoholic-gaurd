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
