import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 px-3 bg-white border border-rose-200/80 rounded-lg text-xs text-slate-700 shadow-xs">
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 border border-emerald-500 flex items-center justify-center text-[9px] font-bold text-white font-mono shadow-xs">
          S
        </span>
        <span className="text-emerald-800 font-medium">Start</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-sm bg-rose-600 border border-rose-500 flex items-center justify-center text-[9px] font-bold text-white font-mono shadow-xs">
          E
        </span>
        <span className="text-rose-800 font-medium">Destination</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-sm bg-slate-800 border border-slate-700"></span>
        <span className="text-slate-600">Wall</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-sm bg-white border border-rose-200"></span>
        <span className="text-slate-600">Unvisited</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-sm bg-rose-100 border border-rose-300"></span>
        <span className="text-rose-700 font-medium">Visited</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 border border-emerald-400"></span>
        <span className="text-emerald-700 font-semibold">Final Path</span>
      </div>
    </div>
  );
};
