import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  type EventPlan,
  generateEventPlan,
  isGeminiConfigured,
  parseEventPlan,
} from "@/lib/gemini";
import {
  AlertCircle,
  CalendarCheck,
  Clock,
  DollarSign,
  KeyRound,
  Lightbulb,
  ListChecks,
  Loader2,
  MapPin,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface AIPlannerPanelProps {
  onUsePlan: (plan: EventPlan) => void;
}

export default function AIPlannerPanel({ onUsePlan }: AIPlannerPanelProps) {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const configured = isGeminiConfigured();

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    setPlan(null);
    setRawText(null);
    setError(null);
    setCheckedItems({});

    try {
      const raw = await generateEventPlan(idea.trim());
      const parsed = parseEventPlan(raw);
      if (parsed) {
        setPlan(parsed);
      } else {
        setRawText(raw);
        setError(
          "Couldn't parse the AI response as a structured plan. Here's what it said:",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!configured) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Gemini API Key Required
        </h3>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          Add your Gemini API key as{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
            VITE_GEMINI_API_KEY
          </code>{" "}
          in your environment to enable AI-powered event planning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
        <div className="absolute inset-0 border border-indigo-200/60 rounded-2xl pointer-events-none" />
        <div className="relative p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                AI Event Planner
              </h3>
              <p className="text-xs text-muted-foreground">
                Powered by Google Gemini
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="ai-idea-input"
            >
              What&apos;s your idea to organize your dream event?
            </label>
            <Textarea
              id="ai-idea-input"
              data-ocid="ai_planner.textarea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A tech hackathon for 200 college students in Mumbai with prizes, workshops, and networking sessions..."
              rows={4}
              className="resize-none bg-background/80 border-indigo-200/60 focus:border-indigo-400 focus:ring-indigo-400/20 placeholder:text-muted-foreground/60"
              disabled={isLoading}
            />
          </div>

          <Button
            data-ocid="ai_planner.submit_button"
            onClick={handleGenerate}
            disabled={isLoading || !idea.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI is crafting your event plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Plan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            data-ocid="ai_planner.loading_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-indigo-500 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-indigo-400/40 animate-ping" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                AI is crafting your event plan...
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This usually takes 5–10 seconds
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            data-ocid="ai_planner.error_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            {rawText && (
              <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap text-muted-foreground">
                {rawText}
              </pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence>
        {plan && !isLoading && (
          <motion.div
            data-ocid="ai_planner.result_card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="border-indigo-200/60 shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarCheck className="w-5 h-5 opacity-80" />
                      <span className="text-sm font-medium opacity-80 uppercase tracking-wider">
                        AI Generated Plan
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight">
                      {plan.eventTitle}
                    </h2>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm font-medium px-3 py-1 shrink-0">
                    {plan.eventType}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <Separator />

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Venue */}
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Venue
                      </span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">
                      {plan.suggestedVenue}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.venueDetails}
                    </p>
                  </div>

                  {/* Date/Time */}
                  <div className="rounded-xl bg-purple-50 border border-purple-100 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Date & Time
                      </span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">
                      {plan.suggestedDate
                        ? new Date(plan.suggestedDate).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "To be confirmed"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.suggestedDate
                        ? new Date(plan.suggestedDate).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : ""}
                    </p>
                  </div>

                  {/* Capacity */}
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Capacity
                      </span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">
                      ~{plan.estimatedCapacity.toLocaleString()} people
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estimated attendance
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Agenda */}
                {plan.agenda.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                        Event Agenda
                      </h4>
                    </div>
                    <ol className="space-y-2">
                      {plan.agenda.map((item, i) => (
                        <li
                          key={`agenda-${item.slice(0, 20)}-${i}`}
                          className="flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-sm text-foreground">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <Separator />

                {/* Required Items */}
                {plan.requiredItems.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500" />
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                        Required Items
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {plan.requiredItems.map((item, i) => (
                        <div
                          key={`req-${item.slice(0, 20)}-${i}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <Checkbox
                            id={`item-${i}`}
                            checked={!!checkedItems[i]}
                            onCheckedChange={() => toggleItem(i)}
                            className="border-amber-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                          />
                          <label
                            htmlFor={`item-${i}`}
                            className={`text-sm cursor-pointer transition-colors ${
                              checkedItems[i]
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Budget Hints */}
                {plan.budgetHints.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                        Budget Hints
                      </h4>
                    </div>
                    <ul className="space-y-1.5">
                      {plan.budgetHints.map((hint, i) => (
                        <li
                          key={`hint-${hint.slice(0, 20)}-${i}`}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pro Tips */}
                {plan.tips.length > 0 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <h4 className="font-semibold text-amber-800 text-sm uppercase tracking-wide">
                        Pro Tips
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {plan.tips.map((tip, i) => (
                        <li
                          key={`tip-${tip.slice(0, 20)}-${i}`}
                          className="flex items-start gap-2 text-sm text-amber-900"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Use This Plan CTA */}
                <Button
                  data-ocid="ai_planner.use_plan_button"
                  onClick={() => onUsePlan(plan)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                  size="lg"
                >
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  Use This Plan to Create Event
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
