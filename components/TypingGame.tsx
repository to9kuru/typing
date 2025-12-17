import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WordItem, GameMode, GameStats } from '../types';
import { StatsCard } from './StatsCard';
import { XCircle } from 'lucide-react';
import { Button } from './Button';

interface TypingGameProps {
  words: WordItem[];
  mode: GameMode;
  onFinish: (stats: GameStats) => void;
  onExit: () => void;
}

export const TypingGame: React.FC<TypingGameProps> = ({ words, mode, onFinish, onExit }) => {
  // Game State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isError, setIsError] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [missedKeystrokes, setMissedKeystrokes] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [history, setHistory] = useState<{ time: number; wpm: number }[]>([]);
  
  // 現在の入力に応じて表示するターゲット文字列（si/shiの切り替え用）
  const [displayTarget, setDisplayTarget] = useState('');

  // Refs for timer and focus
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const currentWord = words[currentWordIndex % words.length];

  // 単語が変わったら表示をリセット
  useEffect(() => {
    setDisplayTarget(currentWord.romaji);
    setInputValue('');
  }, [currentWord]);
  
  // Calculate stats in real-time
  const getStats = useCallback(() => {
    const now = Date.now();
    const start = startTime || now;
    const elapsedMin = (now - start) / 60000;
    const wpm = elapsedMin > 0 ? Math.round((correctKeystrokes / 5) / elapsedMin) : 0;
    const accuracy = correctKeystrokes + missedKeystrokes > 0 
      ? Math.round((correctKeystrokes / (correctKeystrokes + missedKeystrokes)) * 100) 
      : 100;

    return { wpm, accuracy, elapsedSeconds: (now - start) / 1000 };
  }, [startTime, correctKeystrokes, missedKeystrokes]);

  // Timer loop for history
  useEffect(() => {
    if (startTime) {
      timerRef.current = window.setInterval(() => {
        const { wpm, elapsedSeconds } = getStats();
        setHistory(prev => [...prev, { time: Math.floor(elapsedSeconds), wpm }]);
      }, 2000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, getStats]);

  // Focus input on mount and keep focus
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, []);

  // Check win condition for Drill Mode
  useEffect(() => {
    if (mode === GameMode.DRILL_100 && completedCount >= 100) {
      const finalStats = getStats();
      onFinish({
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        elapsedTime: finalStats.elapsedSeconds,
        totalKeystrokes: correctKeystrokes + missedKeystrokes,
        correctKeystrokes,
        missedKeystrokes,
        wordsCompleted: completedCount,
        history,
      });
    }
  }, [completedCount, mode, getStats, onFinish, correctKeystrokes, missedKeystrokes, history]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Start timer on first keystroke
    if (!startTime) {
      setStartTime(Date.now());
    }

    // 柔軟な入力判定ロジック
    // acceptsリストの中に、現在の入力(val)で始まるものがあるか探す
    const matchingPattern = currentWord.accepts.find(pattern => pattern.startsWith(val));

    if (matchingPattern) {
      // 正解ルートに乗っている場合
      setInputValue(val);
      setIsError(false);
      setCorrectKeystrokes(prev => prev + 1);
      
      // ユーザーの入力ルートに合わせて表示ガイドを更新する
      // (例: 'si'と打ったら'shi'ではなく'si'を表示ターゲットにする)
      setDisplayTarget(matchingPattern);

      // 単語入力完了判定
      // acceptsのいずれかと完全一致したらクリア
      const isComplete = currentWord.accepts.some(pattern => pattern === val);
      
      if (isComplete) {
        setCompletedCount(prev => prev + 1);
        setInputValue('');
        setCurrentWordIndex(prev => prev + 1);
        // 次の単語のセットアップはuseEffectが処理
      }
    } else {
      // ミス入力
      // 文字数が増えたときだけミスとしてカウント
      if (val.length > inputValue.length) {
        setMissedKeystrokes(prev => prev + 1);
        setIsError(true);
        setTimeout(() => setIsError(false), 200);
      }
    }
  };

  const { wpm, accuracy } = getStats();

  // Progress Bar for Drill Mode
  const progress = mode === GameMode.DRILL_100 ? (completedCount / 100) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] relative">
      
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4">
        <div className="flex gap-4">
          <StatsCard label="WPM" value={wpm} />
          <StatsCard label="正確性" value={`${accuracy}%`} />
          {mode === GameMode.DRILL_100 && (
            <StatsCard label="残り単語" value={100 - completedCount} color="text-cyan-400" />
          )}
        </div>
        <Button variant="ghost" onClick={onExit} className="text-xs">
          <XCircle size={18} className="mr-2" /> 終了
        </Button>
      </div>

      {/* Progress Line for Drill */}
      {mode === GameMode.DRILL_100 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
          <div 
            className="h-full bg-cyan-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Main Typing Area */}
      <div className="flex flex-col items-center space-y-8 w-full">
        
        {/* Japanese / Display Text */}
        <h2 className="text-4xl md:text-6xl font-bold text-slate-100 mb-4 text-center leading-tight">
          {currentWord.display}
        </h2>

        {/* Romaji visualization */}
        <div className={`text-3xl md:text-5xl font-mono tracking-wide relative transition-colors duration-100 ${isError ? 'text-red-500 translate-x-1' : 'text-slate-500'}`}>
          {/* Render characters based on dynamic displayTarget */}
          {displayTarget.split('').map((char, index) => {
            let colorClass = 'text-slate-600'; // Untyped
            if (index < inputValue.length) {
              colorClass = 'text-indigo-400'; // Typed Correctly
            } else if (index === inputValue.length) {
              colorClass = 'text-slate-400 border-b-2 border-indigo-500'; // Current cursor char
            }
            return (
              <span key={index} className={colorClass}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="opacity-0 absolute top-0 left-0 h-full w-full cursor-default"
          autoFocus
        />

        <div className="text-slate-500 text-sm mt-8">
          {mode === GameMode.ENDLESS ? "キーを打ってスタート（エンドレス）" : "100単語達成でクリア"}
        </div>
      </div>
    </div>
  );
};