import type { Mood } from '@/features/tracking/cycleEngine';

export const MOOD_EMOJI: Record<Mood, string> = {
  great: '😄',
  good: '🙂',
  neutral: '😐',
  low: '😔',
  difficult: '😣',
};
