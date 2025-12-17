export interface WordItem {
  id: string;
  display: string; // 表示されるテキスト（日本語や英語）
  romaji: string;  // 表示用のメインローマ字（基本はヘボン式）
  accepts: string[]; // 許容される入力パターンのリスト（si, shi, ciなど）
}

export enum GameMode {
  SETUP = 'SETUP',
  ENDLESS = 'ENDLESS',
  DRILL_100 = 'DRILL_100',
  RESULTS = 'RESULTS',
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  missedKeystrokes: number;
  elapsedTime: number; // 秒
  wordsCompleted: number;
  history: { time: number; wpm: number }[]; // グラフ用
}

export interface TypingConfig {
  words: WordItem[];
  mode: GameMode;
}