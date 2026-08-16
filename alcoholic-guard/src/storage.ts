import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlcoholGuardRecord } from './models/types';

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
