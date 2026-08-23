import { ActionCategoryId, AlternativeAction, Reward } from '../models/types';

export const ACTION_CATEGORIES: { id: ActionCategoryId; label: string }[] = [
  { id: 'body', label: '身体を切り替える' },
  { id: 'food', label: '飲食' },
  { id: 'environment', label: '環境を変える' },
  { id: 'mind', label: '手・頭を使う' },
  { id: 'reward', label: '報酬・人との接触' },
];

export const REWARD_PRESETS: Reward[] = [
  { id: 'reward-video-30', label: '好きな動画を30分見る', isCustom: false },
  { id: 'reward-snack', label: '小さなご褒美を許可する', isCustom: false },
  { id: 'reward-music', label: '好きな音楽を聴く', isCustom: false },
  { id: 'reward-movie', label: '映画・アニメを見る', isCustom: false },
  { id: 'reward-tomorrow', label: '明日の楽しみを決める', isCustom: false },
  { id: 'reward-coffee', label: 'コーヒーを飲む', isCustom: false },
];

// 約30種類。最初は RECOMMENDED_ACTION_IDS の3件のみ大きく見せる。
export const ACTION_PRESETS: AlternativeAction[] = [
  // 身体を切り替える
  { id: 'body-shower', label: 'シャワーを浴びる', category: 'body', isCustom: false, rewardId: 'reward-video-30' },
  { id: 'body-teeth', label: '歯を磨く', category: 'body', isCustom: false },
  { id: 'body-wash-face', label: '顔を洗う', category: 'body', isCustom: false },
  { id: 'body-stretch', label: 'ストレッチする', category: 'body', isCustom: false },
  { id: 'body-walk-10', label: '10分歩く', category: 'body', isCustom: false },
  { id: 'body-change-clothes', label: '着替える', category: 'body', isCustom: false },

  // 飲食
  { id: 'food-water', label: '水を飲む', category: 'food', isCustom: false },
  { id: 'food-sparkling', label: '炭酸水を飲む', category: 'food', isCustom: false },
  { id: 'food-meal', label: '食事する', category: 'food', isCustom: false },
  { id: 'food-snack', label: '軽食を食べる', category: 'food', isCustom: false },
  { id: 'food-warm-drink', label: '温かい飲み物を飲む', category: 'food', isCustom: false },
  { id: 'food-nonalc', label: '好きなノンアル飲料を飲む', category: 'food', isCustom: false },

  // 環境を変える
  { id: 'env-leave-shelf', label: '酒売場から離れる', category: 'environment', isCustom: false },
  { id: 'env-go-outside', label: '外に出る', category: 'environment', isCustom: false },
  { id: 'env-move-room', label: '別の部屋へ移動する', category: 'environment', isCustom: false },
  { id: 'env-cafe', label: 'カフェ等へ移動する', category: 'environment', isCustom: false },
  { id: 'env-hide-alcohol', label: '酒を視界から外す', category: 'environment', isCustom: false },
  { id: 'env-lie-down', label: '横になって休む', category: 'environment', isCustom: false },

  // 手・頭を使う
  { id: 'mind-game', label: 'ゲームをする', category: 'mind', isCustom: false },
  { id: 'mind-video', label: '動画を見る', category: 'mind', isCustom: false },
  { id: 'mind-clean-5', label: '掃除5分', category: 'mind', isCustom: false },
  { id: 'mind-dishes', label: '食器洗い', category: 'mind', isCustom: false },
  { id: 'mind-pc-work', label: 'PC作業10分', category: 'mind', isCustom: false },
  { id: 'mind-music', label: '音楽を聴く', category: 'mind', isCustom: false },

  // 報酬・人との接触
  { id: 'reward-favorite-food', label: '好きなものを食べる', category: 'reward', isCustom: false },
  { id: 'reward-small-treat', label: '小さなご褒美を許可する', category: 'reward', isCustom: false },
  { id: 'reward-movie-watch', label: '映画・アニメを見る', category: 'reward', isCustom: false },
  { id: 'reward-contact', label: '誰かに連絡する', category: 'reward', isCustom: false },
  { id: 'reward-ai-chat', label: 'AIと短く話す', category: 'reward', isCustom: false },
  { id: 'reward-tomorrow-fun', label: '明日の楽しみを決める', category: 'reward', isCustom: false },
];

// 最初に大きく見せる「おすすめ3件」
export const RECOMMENDED_ACTION_IDS: string[] = [
  'body-shower',
  'food-water',
  'env-go-outside',
];

// 飲酒後の非難しない導線で提示する少数の候補
export const AFTER_DRINK_ACTION_IDS: string[] = [
  'food-water',
  'food-meal',
  'body-shower',
  'env-lie-down',
];
