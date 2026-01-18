import type { FrequencyType } from "@prisma/client";
import { DAY_ABBREVIATIONS, FREQUENCY_LABELS } from "~/lib/habits/types";

interface FrequencySelectorProps {
  frequencyType: FrequencyType;
  targetCount: number;
  specificDays: number[];
  onFrequencyTypeChange: (type: FrequencyType) => void;
  onTargetCountChange: (count: number) => void;
  onSpecificDaysChange: (days: number[]) => void;
}

const FREQUENCY_TYPES: FrequencyType[] = ["DAILY", "WEEKLY", "MONTHLY", "SPECIFIC_DAYS"];

export function FrequencySelector({
  frequencyType,
  targetCount,
  specificDays,
  onFrequencyTypeChange,
  onTargetCountChange,
  onSpecificDaysChange,
}: FrequencySelectorProps) {
  const toggleDay = (day: number) => {
    if (specificDays.includes(day)) {
      onSpecificDaysChange(specificDays.filter((d) => d !== day));
    } else {
      onSpecificDaysChange([...specificDays, day].sort());
    }
  };

  return (
    <div className="space-y-4">
      {/* Frequency type */}
      <div>
        <label className="block text-sm font-bold text-[#00ccff] mb-2">
          Frequency
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FREQUENCY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFrequencyTypeChange(type)}
              className={`
                px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                ${frequencyType === type
                  ? "border-[#00ccff] bg-[#00ccff]/20 text-[#00ccff]"
                  : "border-[#00ff99]/20 text-[#00ff99]/70 hover:border-[#00ff99]/40"
                }
              `}
            >
              {FREQUENCY_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Target count for weekly/monthly */}
      {(frequencyType === "WEEKLY" || frequencyType === "MONTHLY") && (
        <div>
          <label htmlFor="targetCount" className="block text-sm font-bold text-[#00ccff] mb-2">
            How many times per {frequencyType === "WEEKLY" ? "week" : "month"}?
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTargetCountChange(Math.max(1, targetCount - 1))}
              className="w-10 h-10 border border-[#00ff99]/30 rounded-lg text-[#00ff99] hover:border-[#00ccff] transition-colors"
            >
              -
            </button>
            <input
              type="number"
              id="targetCount"
              value={targetCount}
              onChange={(e) => onTargetCountChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min={1}
              max={frequencyType === "WEEKLY" ? 7 : 31}
              className="w-20 text-center px-4 py-2 bg-[#111] border border-[#00ff99]/30 rounded-lg text-[#00ff99] focus:outline-none focus:border-[#00ccff]"
            />
            <button
              type="button"
              onClick={() => onTargetCountChange(targetCount + 1)}
              className="w-10 h-10 border border-[#00ff99]/30 rounded-lg text-[#00ff99] hover:border-[#00ccff] transition-colors"
            >
              +
            </button>
            <span className="text-[#00ff99]/70">
              {targetCount === 1 ? "time" : "times"} per {frequencyType === "WEEKLY" ? "week" : "month"}
            </span>
          </div>
        </div>
      )}

      {/* Specific days selector */}
      {frequencyType === "SPECIFIC_DAYS" && (
        <div>
          <label className="block text-sm font-bold text-[#00ccff] mb-2">
            Which days?
          </label>
          <div className="flex gap-2">
            {DAY_ABBREVIATIONS.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(index)}
                className={`
                  w-10 h-10 rounded-lg border-2 text-xs font-bold transition-all
                  ${specificDays.includes(index)
                    ? "border-[#00ccff] bg-[#00ccff]/20 text-[#00ccff]"
                    : "border-[#00ff99]/20 text-[#00ff99]/50 hover:border-[#00ff99]/40"
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>
          {specificDays.length === 0 && (
            <p className="text-sm text-red-400 mt-2">Select at least one day</p>
          )}
        </div>
      )}
    </div>
  );
}
