import React from 'react';
import { formatResetDate } from '../utils';

const QuotaBadge = ({ remaining, resetDate, imagesThisWeek }) => {
  const total = 10;
  const used = imagesThisWeek || (total - (remaining ?? total));
  const pct = (used / total) * 100;

  const color = remaining <= 0
    ? 'text-red-500 dark:text-red-400'
    : remaining <= 3
    ? 'text-yellow-500 dark:text-yellow-400'
    : 'text-green-500 dark:text-green-400';

  const barColor = remaining <= 0
    ? 'bg-red-500'
    : remaining <= 3
    ? 'bg-yellow-500'
    : 'bg-green-500';

  return (
    <div className="card-base rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weekly Quota</span>
        <span className={`text-sm font-bold ${color}`}>
          {remaining ?? '—'}/10 left
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {remaining <= 0
          ? `Resets ${resetDate ? formatResetDate(resetDate) : 'next Monday'}`
          : `${used} of ${total} images used this week`}
      </p>
    </div>
  );
};

export default QuotaBadge;
