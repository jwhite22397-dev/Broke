import { ArrowLeft, Briefcase, GraduationCap, DollarSign, Heart, Trophy, Calendar } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../game/simulation/financialSystem';
import { describeDecision } from '../game/simulation/opportunity';
import type { TimelineEntry } from '../game/models/types';

const typeIcons: Record<string, typeof Briefcase> = {
  career: Briefcase,
  education: GraduationCap,
  financial: DollarSign,
  relationship: Heart,
  milestone: Trophy,
  event: Calendar,
  business: Briefcase,
};

const typeColors: Record<string, string> = {
  career: 'bg-blue-500',
  education: 'bg-purple-500',
  financial: 'bg-green-500',
  relationship: 'bg-pink-500',
  milestone: 'bg-yellow-500',
  event: 'bg-slate-500',
  business: 'bg-orange-500',
};

export function TimelineScreen() {
  const { gameState, setScreen } = useGameStore();

  if (!gameState) return null;

  const sortedTimeline = [...gameState.timeline].reverse();

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button
        onClick={() => setScreen('more')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Your Life Story</h1>
      <p className="text-slate-400 mb-6">
        {gameState.name}'s journey from age 18 to {gameState.age}
      </p>

      {gameState.majorDecisions.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-2">What if?</h2>
          <div className="space-y-3">
            {gameState.majorDecisions.map((decision, index) => {
              const insight = describeDecision(decision, gameState.date);
              if (!insight) return null;
              return (
                <div key={index}>
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-sm text-slate-400">{insight.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />

        <div className="space-y-4">
          {sortedTimeline.map((entry, index) => (
            <TimelineItem key={index} entry={entry} />
          ))}
        </div>
      </div>

      {sortedTimeline.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400">Your story is just beginning.</p>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const Icon = typeIcons[entry.type] || Calendar;
  const colorClass = typeColors[entry.type] || 'bg-slate-500';

  return (
    <div className="relative pl-10">
      {/* Dot */}
      <div className={`absolute left-2 w-5 h-5 rounded-full ${colorClass} flex items-center justify-center`}>
        <Icon size={12} className="text-white" />
      </div>

      {/* Content */}
      <div className="card">
        <div className="flex items-start justify-between mb-1">
          <span className="text-xs text-slate-500">
            Age {entry.age} • {entry.date.month}/{entry.date.year}
          </span>
          {entry.netWorthAtTime !== undefined && (
            <span className={`text-xs ${entry.netWorthAtTime >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(entry.netWorthAtTime)}
            </span>
          )}
        </div>
        <h3 className="font-semibold">{entry.title}</h3>
        {entry.description && (
          <p className="text-sm text-slate-400 mt-1">{entry.description}</p>
        )}
      </div>
    </div>
  );
}
