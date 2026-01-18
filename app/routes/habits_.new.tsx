import { data, redirect, useFetcher, useNavigate } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { createClient } from "~/lib/supabase/server";
import { createHabit } from "~/lib/habits/queries.server";
import { FrequencySelector } from "~/components/habits/FrequencySelector";
import { useState } from "react";
import type { FrequencyType } from "@prisma/client";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createClient(request);
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData?.user) {
    return redirect("/login");
  }

  return { user: userData.user };
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = createClient(request);
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const emoji = formData.get("emoji") as string || "⭐";
  const color = formData.get("color") as string || "#00ccff";
  const frequencyType = formData.get("frequencyType") as FrequencyType;
  const targetCount = parseInt(formData.get("targetCount") as string, 10) || 1;
  const specificDaysStr = formData.get("specificDays") as string;
  const specificDays = specificDaysStr ? specificDaysStr.split(",").map(Number) : [];

  const errors: { name?: string; frequencyType?: string } = {};

  if (!name || name.trim() === "") {
    errors.name = "Name is required";
  }

  if (!frequencyType) {
    errors.frequencyType = "Frequency is required";
  }

  if (Object.keys(errors).length) {
    return data({ errors }, { status: 400 });
  }

  await createHabit({
    userId: userData.user.id,
    name: name.trim(),
    description: description?.trim() || undefined,
    emoji,
    color,
    frequencyType,
    targetCount,
    specificDays,
  });

  return redirect("/habits");
}

const EMOJI_OPTIONS = ["⭐", "🎸", "📖", "✍️", "💪", "🧘", "🏃", "💧", "🍎", "😴", "🧹", "💰"];
const COLOR_OPTIONS = ["#00ccff", "#00ff99", "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6", "#e74c3c"];

export default function NewHabitRoute() {
  const navigate = useNavigate();
  const fetcher = useFetcher<{ errors?: { name?: string; frequencyType?: string } }>();
  const errors = fetcher.data?.errors;
  const isSubmitting = fetcher.state === "submitting";

  const [emoji, setEmoji] = useState("⭐");
  const [color, setColor] = useState("#00ccff");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("DAILY");
  const [targetCount, setTargetCount] = useState(1);
  const [specificDays, setSpecificDays] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("emoji", emoji);
    formData.set("color", color);
    formData.set("frequencyType", frequencyType);
    formData.set("targetCount", String(targetCount));
    formData.set("specificDays", specificDays.join(","));
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[#00ccff]">New Habit</h1>
        <p className="text-[#00ff99]/70">
          Start building a better you, one habit at a time.
        </p>
      </header>

      {errors && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-xl" role="alert">
          <ul className="list-disc list-inside text-red-300 space-y-1">
            {errors.name && <li>{errors.name}</li>}
            {errors.frequencyType && <li>{errors.frequencyType}</li>}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emoji picker */}
        <div>
          <label className="block text-sm font-bold text-[#00ccff] mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`
                  w-10 h-10 text-xl rounded-lg border-2 transition-all
                  ${emoji === e
                    ? "border-[#00ccff] bg-[#00ccff]/20"
                    : "border-[#00ff99]/20 hover:border-[#00ff99]/40"
                  }
                `}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-sm font-bold text-[#00ccff] mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all
                  ${color === c ? "border-white scale-110" : "border-transparent"}
                `}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-[#00ccff] mb-2">
            Habit Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Practice Guitar"
            className="w-full px-4 py-3 bg-[#111] border border-[#00ff99]/30 rounded-xl text-[#00ff99] placeholder-[#00ff99]/40 focus:outline-none focus:border-[#00ccff]"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-[#00ccff] mb-2">
            Description <span className="text-[#00ff99]/50">(optional)</span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="At least 15 minutes of focused practice"
            className="w-full px-4 py-3 bg-[#111] border border-[#00ff99]/30 rounded-xl text-[#00ff99] placeholder-[#00ff99]/40 focus:outline-none focus:border-[#00ccff]"
          />
        </div>

        {/* Frequency selector */}
        <FrequencySelector
          frequencyType={frequencyType}
          targetCount={targetCount}
          specificDays={specificDays}
          onFrequencyTypeChange={setFrequencyType}
          onTargetCountChange={setTargetCount}
          onSpecificDaysChange={setSpecificDays}
        />

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-3 border border-[#00ff99]/30 rounded-xl text-[#00ff99] hover:border-[#00ccff] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#00ccff] text-black font-bold rounded-xl hover:bg-[#00ff99] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Habit"}
          </button>
        </div>
      </form>
    </div>
  );
}
