interface StreakCounterProps {
  streak: number;
  color?: string;
}

export function StreakCounter({ streak, color = "#00ff99" }: StreakCounterProps) {
  if (streak === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <span aria-hidden="true">🔥</span>
      <span>{streak}</span>
    </div>
  );
}
