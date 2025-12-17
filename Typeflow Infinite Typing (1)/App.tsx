import React, { useState } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { TypingGame } from './components/TypingGame';
import { ResultsScreen } from './components/ResultsScreen';
import { GameMode, WordItem, GameStats, TypingConfig } from './types';

function App() {
  const [gameState, setGameState] = useState<GameMode>(GameMode.SETUP);
  const [config, setConfig] = useState<TypingConfig | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);

  const handleStartGame = (words: WordItem[], mode: GameMode) => {
    setConfig({ words, mode });
    setGameState(mode);
  };

  const handleFinishGame = (finalStats: GameStats) => {
    setStats(finalStats);
    setGameState(GameMode.RESULTS);
  };

  const handleRestart = () => {
    if (config) {
      setGameState(config.mode);
    }
  };

  const handleHome = () => {
    setGameState(GameMode.SETUP);
    setConfig(null);
    setStats(null);
  };

  const handleExitGame = () => {
      handleHome();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <header className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
                TF
            </div>
            <span className="font-bold text-lg tracking-tight">TypeFlow</span>
        </div>
        <div className="text-xs text-slate-500 font-mono">
            {gameState !== GameMode.SETUP ? "プレイ中" : "待機中"}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {gameState === GameMode.SETUP && (
          <SetupScreen onStart={handleStartGame} />
        )}

        {(gameState === GameMode.ENDLESS || gameState === GameMode.DRILL_100) && config && (
          <TypingGame 
            words={config.words} 
            mode={gameState} 
            onFinish={handleFinishGame}
            onExit={handleExitGame}
          />
        )}

        {gameState === GameMode.RESULTS && stats && (
          <ResultsScreen 
            stats={stats} 
            onRestart={handleRestart} 
            onHome={handleHome} 
          />
        )}
      </main>
    </div>
  );
}

export default App;