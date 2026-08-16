import { AvoidanceCandidate, CategoryId } from '../models/types';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'exercise', label: '運動' },
  { id: 'food', label: '食事' },
  { id: 'relax', label: 'リラックス' },
  { id: 'entertainment', label: '娯楽' },
  { id: 'going-out', label: '外出' },
  { id: 'connect', label: '人とつながる' },
  { id: 'free', label: 'お金を使わない' },
  { id: 'quick', label: 'すぐできる' },
];

export const PRESET_CANDIDATES: AvoidanceCandidate[] = [
  { id: 'spec-work', label: 'Alcoholic Guardの要件を30分だけ詰める', categories: ['quick', 'free'], isPreset: true },
  { id: 'gym-prep', label: 'ジムの準備をしてそのまま出る', categories: ['exercise', 'going-out'], isPreset: true },
  { id: 'walk-30', label: '30分だけ散歩する', categories: ['exercise', 'going-out', 'free'], isPreset: true },
  { id: 'shower', label: 'シャワーを浴びる', categories: ['quick', 'relax', 'free'], isPreset: true },
  { id: 'non-alc', label: '水・炭酸水・ノンアルを飲む', categories: ['quick', 'food', 'free'], isPreset: true },
  { id: 'meal', label: 'しっかり飯を食う', categories: ['food'], isPreset: true },
  { id: 'high-protein', label: '高タンパク飯やプロテインを取る', categories: ['food', 'quick'], isPreset: true },
  { id: 'video', label: 'YouTubeやNetflixを30分見る', categories: ['entertainment', 'relax', 'free'], isPreset: true },
  { id: 'game', label: 'ゲームを30分やる', categories: ['entertainment', 'free'], isPreset: true },
  { id: 'music', label: '音楽を聴く・ドラムを叩く', categories: ['entertainment', 'relax', 'free'], isPreset: true },
  { id: 'clean', label: '部屋を1か所だけ掃除する', categories: ['quick', 'free'], isPreset: true },
  { id: 'go-out', label: 'コンビニ以外の場所へ行く', categories: ['going-out'], isPreset: true },
  { id: 'contact', label: '誰かにLINEする・電話する', categories: ['connect', 'quick', 'free'], isPreset: true },
  { id: 'nap', label: 'ベッドで30分だけ横になる', categories: ['relax', 'free'], isPreset: true },
  { id: 'cafe', label: 'カフェに行ってコーヒーやソフトドリンクを飲む', categories: ['going-out', 'food'], isPreset: true },
];
