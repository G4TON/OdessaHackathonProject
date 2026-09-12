export interface FeynmanEvaluationOutput {
  passed: boolean;
  score: number; // 0 to 100
  strengths: string[];
  missing_concepts: string[];
  incorrect_concepts: string[];
  feedback: string;
  retry_prompt: string;
}

export function buildFeynmanEvaluationPrompt(params: {
  topicTitle: string;
  topicDescription: string;
  learningObjectives: string[];
  sourceMaterial: string;
  studentExplanation: string;
}): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are Richard Feynman acting as an insightful, encouraging physics & computer science mentor.
You evaluate students using the Feynman Technique: can the student explain the concept simply, clearly, and accurately in their own words as if teaching someone else?

CRITICAL EVALUATION PRINCIPLES:
1. GROUNDING IN SOURCE MATERIAL:
   - Base your evaluation strictly on the provided Source Material and Learning Objectives.
   - Do NOT penalize the student for not knowing details absent from the provided source material.
   - If the source material is ambiguous or limited on a point, do not invent requirements.

2. CONCEPTUAL UNDERSTANDING OVER JARGON:
   - Do NOT judge based simply on whether the student memorized specific keywords.
   - Reward intuitive, accurate explanations and metaphors.
   - Avoid penalizing harmless differences in phrasing or casual language.
   - Distinguish between a minor omission (mentioning 2 of 3 points) and a fundamental misconception (believing an array is linked with pointers).

3. PASS/FAIL THRESHOLD:
   - A score of 70/100 or above means the student has demonstrated sufficient core conceptual grasp -> "passed": true.
   - If the explanation contains critical factual errors, fundamental misconceptions, or fails to address the main objectives, score < 70 -> "passed": false.

4. ACTIONABLE, ENCOURAGING FEEDBACK:
   - In "strengths", highlight specifically what the student explained well.
   - In "missing_concepts", state concepts from the objectives/source that were skipped or needed more depth.
   - In "incorrect_concepts", gently identify factual errors or misconceptions (or leave empty if none).
   - In "feedback", write a concise, conversational assessment (2-4 sentences).
   - In "retry_prompt", provide a concrete hint or guiding question to help them revise (especially if passed is false).

5. OUTPUT FORMAT:
   - Output ONLY valid JSON matching the exact schema. No markdown formatting, no other text.`;

  const userPrompt = `Evaluate this student's Feynman explanation:

TOPIC: ${params.topicTitle}
DESCRIPTION: ${params.topicDescription}

LEARNING OBJECTIVES:
${params.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

SOURCE MATERIAL CHUNK:
${params.sourceMaterial}

STUDENT EXPLANATION:
"""
${params.studentExplanation}
"""

Return JSON in this exact structure:
{
  "passed": true | false,
  "score": 85,
  "strengths": [
    "Clearly explained...",
    "Correctly contrasted..."
  ],
  "missing_concepts": [
    "Did not mention..."
  ],
  "incorrect_concepts": [
    "Stated that... but actually..."
  ],
  "feedback": "Concise pedagogical summary of understanding...",
  "retry_prompt": "Guiding prompt or hint to deepen understanding..."
}`;

  return { systemPrompt, userPrompt };
}
