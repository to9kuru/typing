import React from 'react';
import { GameStats } from '../types';
import { Button } from './Button';
import { RotateCcw, Home, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultsScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ stats, onRestart, onHome }) => {
  return (
    <div className="max-w-4xl mx-auto w-full p-8 animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-full text-yellow-500 mb-4">
          <Trophy size={32} />
        </div>
        <h2 className="text-3xl font-bold text-white">練習終了</h2>
        <p className="text-slate-400">お疲れ様でした！今回のスコアです。</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
          <span className="text-slate-400 text-sm uppercase">WPM</span>
          <span className="text-4xl font-mono font-bold text-indigo-400">{stats.wpm}</span>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
          <span className="text-slate-400 text-sm uppercase">正確性</span>
          <span className="text-4xl font-mono font-bold text-emerald-400">{stats.accuracy}%</span>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
          <span className="text-slate-400 text-sm uppercase">時間</span>
          <span className="text-4xl font-mono font-bold text-slate-200">{Math.floor(stats.elapsedTime)}秒</span>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center">
          <span className="text-slate-400 text-sm uppercase">完了単語数</span>
          <span className="text-4xl font-mono font-bold text-slate-200">{stats.wordsCompleted}</span>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-64 w-full">
        <h3 className="text-slate-400 text-sm mb-4">WPM推移</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#64748b" tickFormatter={(val) => `${val}s`} />
            <YAxis stroke="#64748b" />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#818cf8' }}
            />
            <Line type="monotone" dataKey="wpm" stroke="#818cf8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={onRestart} variant="primary">
          <RotateCcw className="mr-2" size={18} /> もう一度
        </Button>
        <Button onClick={onHome} variant="secondary">
          <Home className="mr-2" size={18} /> 単語を選び直す
        </Button>
      </div>
    </div>
  );
};