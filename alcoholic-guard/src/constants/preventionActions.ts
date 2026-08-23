import { PreventionAction } from '../models/types';

// 飲酒欲求が強くなる前に、先回りして行う予防行動。
// 代替行動（欲求が出たあとに使うもの）とは別概念として扱う。
export const PREVENTION_ACTION_PRESETS: PreventionAction[] = [
  { id: 'prevent-meal-first', label: '先に食事する', isCustom: false, rewardId: 'reward-coffee' },
  { id: 'prevent-shower', label: 'シャワー・風呂に入る', isCustom: false, rewardId: 'reward-video-30' },
  { id: 'prevent-avoid-route', label: '酒を買う場所・ルートを避ける', isCustom: false },
  { id: 'prevent-no-alcohol-home', label: '酒を家に置かない', isCustom: false },
  { id: 'prevent-schedule-risk-time', label: '危険な時間帯に予定を1個入れる', isCustom: false },
  { id: 'prevent-prepare-drink', label: '代わりの飲み物を準備する', isCustom: false },
  { id: 'prevent-decide-reward', label: '今日のご褒美を先に決める', isCustom: false },
  { id: 'prevent-contact-someone', label: '危険になる前に誰かと接触する', isCustom: false },
  { id: 'prevent-simple-task', label: '5〜10分の単純作業を開始する', isCustom: false },
  { id: 'prevent-decide-goal-time', label: '夜のゴール時刻を朝に決める', isCustom: false },
];

// 予防行動を実行した際の短い応援メッセージ（長文は不要）
export const PREVENTION_DONE_MESSAGES: string[] = [
  '先回り成功',
  'いい、その1個で十分',
  '今日のガード +1',
  '流れを変えた',
  '次につながった',
];

export function pickPreventionDoneMessage(): string {
  const index = Math.floor(Math.random() * PREVENTION_DONE_MESSAGES.length);
  return PREVENTION_DONE_MESSAGES[index];
}
