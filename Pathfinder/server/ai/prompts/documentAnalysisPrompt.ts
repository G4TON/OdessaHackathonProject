export interface DocumentAnalysisTopicOutput {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
  learning_objectives: string[];
  prerequisites: string[]; // IDs or exact titles of earlier topics
  source_chunk: string;
}

export interface DocumentAnalysisOutput {
  title: string;
  description: string;
  topics: DocumentAnalysisTopicOutput[];
}

export function buildDocumentAnalysisPrompt(documentText: string): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are an expert pedagogical curriculum designer and cognitive learning scientist.
Your task is to analyze study material and generate a structured, conceptual learning path.

CRITICAL INSTRUCTIONS:
1. Identify the core conceptual topics and subtopics in the material.
2. DO NOT simply split by page numbers or arbitrary paragraphs. Identify genuine conceptual progression.
3. Order the topics logically so prerequisites naturally precede dependent concepts.
4. For each topic:
   - Provide a clear, actionable title and a 1-2 sentence conceptual description.
   - Assign an approximate difficulty ('beginner', 'intermediate', or 'advanced').
   - Estimate realistic study duration in minutes (between 15 and 45 minutes).
   - Define 2 to 4 concrete, verifiable learning objectives (e.g. "Explain how...", "Contrast X with Y...").
   - Extract a self-contained source_chunk (150-400 words) from the document that explains this topic, which will be used for grounding and Feynman evaluation.
   - Define prerequisites: an array of previous topic IDs or exact titles that must be learned before this topic. The first topic should have empty prerequisites [].
5. Respond ONLY with a valid JSON object matching the requested schema. No markdown wrapping, no introductory or concluding conversational text.`;

  const userPrompt = `Analyze the following study material and return a structured learning path JSON object:

Schema:
{
  "title": "Clear concise document title",
  "description": "1-2 sentence overview of the subject",
  "topics": [
    {
      "id": "topic-1",
      "title": "Topic Name",
      "description": "Conceptual summary",
      "difficulty": "beginner | intermediate | advanced",
      "estimated_minutes": 25,
      "learning_objectives": [
        "Explain...",
        "Describe..."
      ],
      "prerequisites": [],
      "source_chunk": "Extracted text segment from the material explaining this topic..."
    }
  ]
}

--- SOURCE MATERIAL START ---
${documentText.slice(0, 18000)}
--- SOURCE MATERIAL END ---`;

  return { systemPrompt, userPrompt };
}
