import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, subValue, color = "text-indigo-400" }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center min-w-[120px]">
      <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-3xl font-bold font-mono ${color}`}>{value}</span>
      {subValue && <span className="text-slate-500 text-xs mt-1">{subValue}</span>}
    </div>
  );
};