import React, { useState } from 'react';
import { generateTypingList } from '../services/geminiService';
import { WordItem, GameMode } from '../types';
import { Button } from './Button';
import { Wand2, Keyboard } from 'lucide-react';

interface SetupScreenProps {
  onStart: (words: WordItem[], mode: GameMode) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const words = await generateTypingList(input);
      return words;
    } catch (e) {
      setError("AI生成に失敗しました。ネットワーク接続などを確認してください。");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStart = async (mode: GameMode) => {
    const generatedWords = await handleGenerate();
    if (generatedWords && generatedWords.length > 0) {
        onStart(generatedWords, mode);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          TypeFlow
        </h1>
        <p className="text-slate-400">
          好きな単語、歌詞、テーマなどを入力してください。<br/>AIが練習メニューを作成します。
        </p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-1 shadow-xl border border-slate-700">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例: 『Reactのフック』、『美味しい寿司ネタ』、『J-POPの歌詞』、または練習したい文章..."
          className="w-full h-40 bg-slate-900/50 text-slate-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono text-sm border-none placeholder:text-slate-600"
        />
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors group">
            <div className="flex items-center gap-3 mb-3 text-indigo-400">
                <div className="p-2 bg-indigo-500/10 rounded-lg"><Keyboard size={20} /></div>
                <h3 className="font-bold">エンドレスモード</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 h-10">
                生成されたリストを永遠にタイピングし続けます。リラックスしてリズムを掴みましょう。
            </p>
            <Button 
                onClick={() => handleStart(GameMode.ENDLESS)} 
                isLoading={isGenerating}
                className="w-full"
            >
                スタート
            </Button>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-colors group">
            <div className="flex items-center gap-3 mb-3 text-cyan-400">
                <div className="p-2 bg-cyan-500/10 rounded-lg"><Wand2 size={20} /></div>
                <h3 className="font-bold">百本ノック</h3>
            </div>
             <p className="text-xs text-slate-500 mb-4 h-10">
                100語をどれだけ速く正確に打てるか挑戦します。完了後に結果グラフが表示されます。
            </p>
            <Button 
                onClick={() => handleStart(GameMode.DRILL_100)} 
                isLoading={isGenerating}
                variant="secondary"
                className="w-full hover:bg-cyan-900/30 hover:text-cyan-200 hover:border-cyan-500/50"
            >
                挑戦する
            </Button>
        </div>
      </div>
    </div>
  );
};