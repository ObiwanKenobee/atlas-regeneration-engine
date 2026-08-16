import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAtlas } from "@/lib/atlas/copilot.functions";
import { ActionButton } from "./ui";

export function AtlasCopilot({
  mode = "copilot",
  context,
  suggestions,
  placeholder,
  compact,
}: {
  mode?: "copilot" | "whatif";
  context?: string;
  suggestions: string[];
  placeholder: string;
  compact?: boolean;
}) {
  const ask = useServerFn(askAtlas);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await ask({ data: { question: q, mode, context } });
      setAnswer(res.answer);
    } catch {
      setAnswer("ATLAS is unreachable right now. The deterministic models remain available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(question);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          className="num flex-1 rounded-sm border border-border bg-surface-2 px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/70"
        />
        <ActionButton type="submit" disabled={loading}>
          {loading ? "THINKING…" : mode === "whatif" ? "EXPLORE IT" : "ASK ATLAS"}
        </ActionButton>
      </form>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuestion(s);
                void submit(s);
              }}
              className="rounded-sm border border-border px-2.5 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="label-xs mt-4 animate-pulse">
          Traversing dependency graph · checking provenance · assembling trade-offs…
        </div>
      )}

      {answer && (
        <pre className="animate-rise mt-4 max-h-[46vh] overflow-auto whitespace-pre-wrap rounded-sm border border-border bg-surface-2/70 p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
          {answer}
        </pre>
      )}
    </div>
  );
}
