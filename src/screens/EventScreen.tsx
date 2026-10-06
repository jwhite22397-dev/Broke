import { AlertCircle, HelpCircle, Gift, Briefcase, Heart, DollarSign } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getAvailableChoices } from '../game/simulation/eventSystem';
import { formatCurrency } from '../game/simulation/financialSystem';
import type { EventChoice, GameState } from '../game/models/types';

const categoryIcons: Record<string, typeof AlertCircle> = {
  emergency: AlertCircle,
  career: Briefcase,
  financial: DollarSign,
  relationship: Heart,
  opportunity: Gift,
  health: HelpCircle,
  lifestyle: HelpCircle,
};

const categoryColors: Record<string, string> = {
  emergency: 'from-red-500/20 to-orange-500/20 border-red-500/50',
  career: 'from-blue-500/20 to-cyan-500/20 border-blue-500/50',
  financial: 'from-green-500/20 to-emerald-500/20 border-green-500/50',
  relationship: 'from-pink-500/20 to-rose-500/20 border-pink-500/50',
  opportunity: 'from-purple-500/20 to-violet-500/20 border-purple-500/50',
  health: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/50',
  lifestyle: 'from-slate-500/20 to-gray-500/20 border-slate-500/50',
};

export function EventScreen() {
  const { gameState, currentEvent, handleEventChoice } = useGameStore();

  if (!gameState || !currentEvent) {
    return null;
  }

  const availableChoices = getAvailableChoices(currentEvent, gameState);
  const Icon = categoryIcons[currentEvent.category] || HelpCircle;
  const colorClass = categoryColors[currentEvent.category] || categoryColors.lifestyle;

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col">
      {/* Event Card */}
      <div className={`card bg-gradient-to-br ${colorClass} flex-1`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-900/50 rounded-2xl flex items-center justify-center">
            <Icon size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide capitalize">
              {currentEvent.category}
            </p>
            <h1 className="text-2xl font-bold">{currentEvent.title}</h1>
          </div>
        </div>

        <p className="text-slate-200 text-lg mb-8 leading-relaxed">
          {currentEvent.description}
        </p>

        {/* Choices */}
        <div className="space-y-3">
          {availableChoices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              onClick={() => handleEventChoice(choice)}
              gameState={gameState}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChoiceButton({ 
  choice, 
  onClick,
  gameState,
}: { 
  choice: EventChoice; 
  onClick: () => void;
  gameState: GameState;
}) {
  const effects = choice.effects;
  const effectsList: string[] = [];

  if (effects.cash !== undefined) {
    if (effects.cash > 0) {
      effectsList.push(`+${formatCurrency(effects.cash)}`);
    } else if (effects.cash < 0) {
      effectsList.push(formatCurrency(effects.cash));
    }
  }
  if (effects.stress !== undefined) {
    if (effects.stress > 0) effectsList.push(`+${effects.stress} stress`);
    else if (effects.stress < 0) effectsList.push(`${effects.stress} stress`);
  }
  if (effects.happiness !== undefined) {
    if (effects.happiness > 0) effectsList.push(`+${effects.happiness} happiness`);
    else if (effects.happiness < 0) effectsList.push(`${effects.happiness} happiness`);
  }
  if (effects.health !== undefined) {
    if (effects.health > 0) effectsList.push(`+${effects.health} health`);
    else if (effects.health < 0) effectsList.push(`${effects.health} health`);
  }
  if (effects.creditScore !== undefined) {
    if (effects.creditScore > 0) effectsList.push(`+${effects.creditScore} credit`);
    else if (effects.creditScore < 0) effectsList.push(`${effects.creditScore} credit`);
  }
  if (effects.skill) {
    effectsList.push(`+${effects.skill.amount} ${effects.skill.skill}`);
  }
  if (effects.addLoan) {
    effectsList.push(`+${formatCurrency(effects.addLoan.principal)} debt`);
  }

  const isDisabled = choice.requirements && (
    (choice.requirements.minCash !== undefined && gameState.cash < choice.requirements.minCash) ||
    (choice.requirements.minCreditScore !== undefined && gameState.creditScore < choice.requirements.minCreditScore)
  );

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full p-4 rounded-xl text-left transition-all ${
        isDisabled 
          ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
          : 'bg-slate-900/80 hover:bg-slate-900 active:scale-98'
      }`}
    >
      <p className="font-semibold mb-1">{choice.text}</p>
      {effectsList.length > 0 && (
        <p className="text-sm text-slate-400">
          {effectsList.join(' • ')}
        </p>
      )}
      {isDisabled && choice.requirements?.minCash && (
        <p className="text-xs text-red-400 mt-1">
          Requires {formatCurrency(choice.requirements.minCash)}
        </p>
      )}
    </button>
  );
}
