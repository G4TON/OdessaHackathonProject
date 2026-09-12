export interface RevisionScheduleOutput {
  recommended_intervals_days: number[];
  reasoning: string;
  focus_areas: string[];
}

export function buildRevisionPrompt(params: {
  topicTitle: string;
  score: number;
  passed: boolean;
  missingConcepts: string[];
  incorrectConcepts: string[];
  previousAttemptsCount: number;
}): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a cognitive memory optimization specialist utilizing the Ebbinghaus forgetting curve and Leitner spaced repetition principles.
Calculate appropriate spaced repetition review intervals based on a student's performance on a topic.

Guidelines:
- If passed with high mastery (score >= 85) on 1st attempt: 3 days, 7 days, 14 days.
- If passed with moderate score (70-84): 2 days, 5 days, 10 days.
- If failed or struggled (score < 70 or multiple attempts): 1 day, 3 days, 7 days.
Respond ONLY with valid JSON.`;

  const userPrompt = `Determine revision schedule for:
Topic: ${params.topicTitle}
Score: ${params.score}/100
Passed: ${params.passed}
Attempts: ${params.previousAttemptsCount}
Missing Concepts: ${params.missingConcepts.join(', ') || 'None'}
Incorrect Concepts: ${params.incorrectConcepts.join(', ') || 'None'}

Return JSON:
{
  "recommended_intervals_days": [1, 3, 7],
  "reasoning": "Short explanation of interval strategy",
  "focus_areas": ["Key concept to review"]
}`;

  return { systemPrompt, userPrompt };
}
