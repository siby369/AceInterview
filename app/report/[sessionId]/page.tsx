import { notFound } from "next/navigation";
import {
  getBehavioralAnswersForSession,
  getCodeSubmissionsForSession,
  getQuestionsForSession,
  getSession
} from "@/lib/store";
import {
  computeBehavioralAverageScore,
  computeSessionOverallScore,
  computeTechnicalAverageScore,
  suggestNextPracticeType
} from "@/lib/scoring";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: { sessionId: string };
}

export default function ReportPage({ params }: PageProps) {
  const session = getSession(params.sessionId);
  if (!session) {
    notFound();
  }

  const questions = getQuestionsForSession(session);
  const behavioralAnswers = getBehavioralAnswersForSession(session.id);
  const codeSubs = getCodeSubmissionsForSession(session.id);

  const behavioralAverage = computeBehavioralAverageScore(behavioralAnswers);
  const technicalAverage = computeTechnicalAverageScore(codeSubs);
  const overallScore = computeSessionOverallScore(
    session,
    behavioralAverage,
    technicalAverage
  );

  const strengths: string[] = [];
  const focusAreas: string[] = [];

  if (behavioralAverage != null && behavioralAverage >= 65) {
    strengths.push("Behavioral answers show good clarity and content.");
  } else {
    focusAreas.push(
      "Practice structuring behavioral answers with STAR (Situation, Task, Action, Result)."
    );
  }

  if (technicalAverage != null && technicalAverage >= 65) {
    strengths.push("Technical problem solving is heading in a solid direction.");
  } else {
    focusAreas.push(
      "Spend more time on practicing DS/Algo or implementation exercises at the chosen difficulty."
    );
  </cises at the chosen difficulty."
    );
  }

  if (session.personaType === "esl") {
    strengths.push("You are actively practicing English speaking. Keep going.");
    focusAreas.push(
      "Keep answers short and clear. Focus on simple sentences and key points."
    );
  }

  const recommendedNext = suggestNextPracticeType({
    session,
    behavioralAverage,
    technicalAverage
  });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            Session summary
          </h1>
          <p className="text-sm text-slate-400">
            A gentle snapshot of how this practice session went.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge>Type: {session.type}</Badge>
          <Badge>Difficulty: {session.difficulty}</Badge>
          <Badge>Role: {session.roleTarget}</Badge>
          <Badge>Goal: {session.personaType}</Badge>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overall score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-50">
              {overallScore != null ? `${overallScore.toFixed(0)} / 100` : "—"}
            </div>
            <CardDescription className="mt-1">
              Scores are a guide, not a judgment. Use them to see direction over time.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Technical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl text-slate-50">
              {technicalStats.averageScore != null
                ? `${technicalStats.averageScore.toFixed(0)} / 100`
                : "—"}
            </div>
            <CardDescription className="mt-1">
              Based on correctness, efficiency, and code quality across coding questions.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Behavioral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl text-slate-50">
              {behavioralStats.averageScore != null
                ? `${behavioralStats.averageScore.toFixed(0)} / 100`
                : "—"}
            </div>
            <CardDescription className="mt-1">
              Based on content, structure, and communication in your spoken answers.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Key strengths</CardTitle>
            <CardDescription>
              Things you&apos;re already doing reasonably well.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-200">
                {strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                This was an early session. Your biggest strength is that you started.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Focus next on</CardTitle>
            <CardDescription>
              2–3 areas to practice in your upcoming sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {focusAreas.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-200">
                {focusAreas.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">
                Keep practicing similar questions to reinforce your current strengths.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Suggested next practice</CardTitle>
            <CardDescription>
              A simple recommendation for your very next session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-200">{recommendedNext}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions in this session</CardTitle>
          <CardDescription>
            Use these to revisit and refine your answers later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-slate-200">
            {questions.map((q, index) => (
              <li key={q.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400">
                      Question {index + 1} • {q.kind}
                    </div>
                    <div className="font-medium">{q.title}</div>
                    <p className="mt-1 text-xs text-slate-300 whitespace-pre-line">
                      {q.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}