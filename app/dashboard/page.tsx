import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function fetchSummary() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/dashboard/summary`, {
    cache: "no-store"
  }).catch(() => null);

  if (!res || !res.ok) {
    return null;
  }
  return (await res.json()) as {
    totalInterviews: number;
    averageScore: number | null;
    sessions: Array<{
      id: string;
      date: string;
      type: string;
      score: number | null;
      trend: "improved" | "dropped" | "same";
    }>;
    breakdown: {
      technicalAverage: number | null;
      behavioralAverage: number | null;
    };
  };
}

async function DashboardContent() {
  const summary = await fetchSummary();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-50">Your practice journey</h1>
      <p className="text-sm text-slate-400">
        Track how your mock interviews are going over time. Scores are simple and constructive,
        not harsh.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-50">
              {summary ? summary.totalInterviews : 0}
            </div>
            <CardDescription className="mt-1">
              Every session is practice, not a verdict.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-50">
              {summary?.averageScore != null ? `${summary.averageScore.toFixed(0)} / 100` : "—"}
            </div>
            <CardDescription className="mt-1">
              Scores help you see direction, not perfection.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tech vs Behavioral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 text-sm text-slate-200">
              <div>
                <div className="text-xs text-slate-400">Technical</div>
                <div>
                  {summary?.breakdown.technicalAverage != null
                    ? `${summary.breakdown.technicalAverage.toFixed(0)}`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Behavioral</div>
                <div>
                  {summary?.breakdown.behavioralAverage != null
                    ? `${summary.breakdown.behavioralAverage.toFixed(0)}`
                    : "—"}
                </div>
              </div>
            </div>
            <CardDescription className="mt-1">
              Balance your coding practice with communication skills.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
          <CardDescription>
            A quick look at how your last interviews went.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary && summary.sessions.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {summary.sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">
                      {new Date(s.date).toLocaleDateString()}
                    </span>
                    <span className="text-slate-100 capitalize">
                      {s.type} interview
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-50">
                      {s.score != null ? `${s.score.toFixed(0)} / 100` : "—"}
                    </span>
                    <Badge
                      className={
                        s.trend === "improved"
                          ? "bg-emerald-900/70 text-emerald-200"
                          : s.trend === "dropped"
                          ? "bg-rose-900/70 text-rose-200"
                          : "bg-slate-800 text-slate-200"
                      }
                    >
                      {s.trend === "improved"
                        ? "Improved"
                        : s.trend === "dropped"
                        ? "Dropped"
                        : "Steady"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">
              No interviews yet. Start with a short 15-minute session to warm up.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-slate-400">
          Loading your progress…
        </div>
      }
    >
      {/* @ts-expect-error Async Server Component */}
      <DashboardContent />
    </Suspense>
  );
}