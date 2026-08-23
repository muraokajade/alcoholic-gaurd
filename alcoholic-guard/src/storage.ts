import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActionLogEntry,
  AlcoholGuardRecord,
  AlternativeAction,
  AppSettings,
  DailyStatus,
  MorningCheckin,
  PreventionAction,
  PreventionPlan,
  Reward,
} from './models/types';

const STORAGE_KEY = '@alcoholic_guard/records';

export async function saveGuardRecord(record: AlcoholGuardRecord): Promise<void> {
  const existing = await loadGuardRecords();
  existing.push(record);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export async function loadGuardRecords(): Promise<AlcoholGuardRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AlcoholGuardRecord[];
  } catch {
    return [];
  }
}

// === v1: 日付ユーティリティ ===

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

// === v1: 設定 ===

const SETTINGS_KEY = '@alcoholic_guard/settings';

const DEFAULT_SETTINGS: AppSettings = {
  dailyAlcoholCost: 1000,
  totalMoneySaved: 0,
};

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function updateDailyAlcoholCost(dailyAlcoholCost: number): Promise<AppSettings> {
  const settings = await loadSettings();
  const next = { ...settings, dailyAlcoholCost };
  await saveSettings(next);
  return next;
}

// === v1: 一日の状態（朝チェックイン + 夜の結果） ===

const DAILY_STATUS_KEY = '@alcoholic_guard/dailyStatus';

function emptyDailyStatus(date: string): DailyStatus {
  return {
    date,
    checkin: null,
    drank: false,
    achieved: false,
    moneySaved: 0,
    guardActionCount: 0,
    finalizedAt: null,
  };
}

async function loadAllDailyStatus(): Promise<Record<string, DailyStatus>> {
  const raw = await AsyncStorage.getItem(DAILY_STATUS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, DailyStatus>;
  } catch {
    return {};
  }
}

async function saveAllDailyStatus(all: Record<string, DailyStatus>): Promise<void> {
  await AsyncStorage.setItem(DAILY_STATUS_KEY, JSON.stringify(all));
}

export async function getDailyStatus(date: string): Promise<DailyStatus> {
  const all = await loadAllDailyStatus();
  return all[date] ?? emptyDailyStatus(date);
}

async function upsertDailyStatus(
  date: string,
  updater: (current: DailyStatus) => DailyStatus
): Promise<DailyStatus> {
  const all = await loadAllDailyStatus();
  const current = all[date] ?? emptyDailyStatus(date);
  const next = updater(current);
  all[date] = next;
  await saveAllDailyStatus(all);
  return next;
}

export async function saveMorningCheckin(checkin: MorningCheckin): Promise<DailyStatus> {
  return upsertDailyStatus(checkin.date, (current) => ({
    ...current,
    checkin,
  }));
}

export async function recordDrank(date: string): Promise<DailyStatus> {
  return upsertDailyStatus(date, (current) => ({
    ...current,
    drank: true,
    achieved: false,
  }));
}

// ゴール時刻に到達し、飲酒していない場合に「超人達成」として確定する。
// 既に確定済みの日は、累計金額の二重加算を避けるため何もしない（べき等）。
export async function finalizeAchievement(date: string): Promise<DailyStatus> {
  const settings = await loadSettings();
  let newlyFinalized = false;

  const result = await upsertDailyStatus(date, (current) => {
    if (current.finalizedAt || current.drank) {
      return current;
    }
    newlyFinalized = true;
    return {
      ...current,
      achieved: true,
      moneySaved: settings.dailyAlcoholCost,
      finalizedAt: new Date().toISOString(),
    };
  });

  if (newlyFinalized) {
    await saveSettings({
      ...settings,
      totalMoneySaved: settings.totalMoneySaved + settings.dailyAlcoholCost,
    });
  }

  return result;
}

export async function incrementGuardActionCount(date: string): Promise<DailyStatus> {
  return upsertDailyStatus(date, (current) => ({
    ...current,
    guardActionCount: current.guardActionCount + 1,
  }));
}

// === v1: 代替行動（ユーザー独自） ===

const CUSTOM_ACTIONS_KEY = '@alcoholic_guard/customActions';

export async function loadCustomActions(): Promise<AlternativeAction[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_ACTIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AlternativeAction[];
  } catch {
    return [];
  }
}

export async function addCustomAction(action: AlternativeAction): Promise<void> {
  const existing = await loadCustomActions();
  existing.push(action);
  await AsyncStorage.setItem(CUSTOM_ACTIONS_KEY, JSON.stringify(existing));
}

export async function deleteCustomAction(id: string): Promise<void> {
  const existing = await loadCustomActions();
  await AsyncStorage.setItem(
    CUSTOM_ACTIONS_KEY,
    JSON.stringify(existing.filter((a) => a.id !== id))
  );
}

// === v1: ご褒美（ユーザー独自） ===

const CUSTOM_REWARDS_KEY = '@alcoholic_guard/customRewards';

export async function loadCustomRewards(): Promise<Reward[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_REWARDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Reward[];
  } catch {
    return [];
  }
}

export async function addCustomReward(reward: Reward): Promise<void> {
  const existing = await loadCustomRewards();
  existing.push(reward);
  await AsyncStorage.setItem(CUSTOM_REWARDS_KEY, JSON.stringify(existing));
}

// === v1: 行動実績 ===

const ACTION_LOGS_KEY = '@alcoholic_guard/actionLogs';

export async function loadActionLogs(): Promise<ActionLogEntry[]> {
  const raw = await AsyncStorage.getItem(ACTION_LOGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ActionLogEntry[];
  } catch {
    return [];
  }
}

export async function logAction(actionId: string, actionLabel: string): Promise<void> {
  const entry: ActionLogEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    actionId,
    actionLabel,
    date: todayKey(),
    createdAt: new Date().toISOString(),
  };
  const existing = await loadActionLogs();
  existing.push(entry);
  await AsyncStorage.setItem(ACTION_LOGS_KEY, JSON.stringify(existing));
  await incrementGuardActionCount(entry.date);
}

export async function getTodayActionCount(): Promise<number> {
  const status = await getDailyStatus(todayKey());
  return status.guardActionCount;
}

// === v1.1: 予防行動（ユーザー独自） ===
// 既存の代替行動カスタム登録（customActions）とは別キーで保存する。

const CUSTOM_PREVENTION_ACTIONS_KEY = '@alcoholic_guard/customPreventionActions';

export async function loadCustomPreventionActions(): Promise<PreventionAction[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_PREVENTION_ACTIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PreventionAction[];
  } catch {
    return [];
  }
}

export async function addCustomPreventionAction(action: PreventionAction): Promise<void> {
  const existing = await loadCustomPreventionActions();
  existing.push(action);
  await AsyncStorage.setItem(CUSTOM_PREVENTION_ACTIONS_KEY, JSON.stringify(existing));
}

// === v1.1: 今日の予防ガード計画 ===

const PREVENTION_PLANS_KEY = '@alcoholic_guard/preventionPlans';

async function loadAllPreventionPlans(): Promise<Record<string, PreventionPlan>> {
  const raw = await AsyncStorage.getItem(PREVENTION_PLANS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, PreventionPlan>;
  } catch {
    return {};
  }
}

async function saveAllPreventionPlans(all: Record<string, PreventionPlan>): Promise<void> {
  await AsyncStorage.setItem(PREVENTION_PLANS_KEY, JSON.stringify(all));
}

export async function getPreventionPlan(date: string): Promise<PreventionPlan> {
  const all = await loadAllPreventionPlans();
  return all[date] ?? { date, items: [] };
}

export async function savePreventionPlan(plan: PreventionPlan): Promise<void> {
  const all = await loadAllPreventionPlans();
  all[plan.date] = plan;
  await saveAllPreventionPlans(all);
}

export async function markPreventionItemDone(date: string, actionId: string): Promise<PreventionPlan> {
  const all = await loadAllPreventionPlans();
  const current = all[date] ?? { date, items: [] };
  const next: PreventionPlan = {
    ...current,
    items: current.items.map((item) =>
      item.actionId === actionId
        ? { ...item, done: true, doneAt: new Date().toISOString() }
        : item
    ),
  };
  all[date] = next;
  await saveAllPreventionPlans(all);
  return next;
}
