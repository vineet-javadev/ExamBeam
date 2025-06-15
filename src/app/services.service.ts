import { Injectable } from '@angular/core';
import { QuestionResponse, QuestionsAnswerResponse } from './app.component';
import { Mistral } from "@mistralai/mistralai";
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  apiKey = environment.MISTRAL_API_KEY;

  client = new Mistral({ apiKey: this.apiKey });

  async getQuestion(topic: string, examType: string): Promise<any> {
    const chatResponse = await this.client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: 'user', content: this.messageToPrompt(topic, examType) }],
    });
    return chatResponse.choices?.[0]?.message?.content || null;
  }

  constructor() {
  }

  // Here i have to create 3 methods. 
  // 1 for - Fetch mcq quetion according to topic
  // 2 for - Fetch a quetion (Short / Long)
  // 3 for - Check the answer is correct or not

  async Question(topic: string, type: string): Promise<QuestionResponse | QuestionResponse[]> {
    let response = await this.getQuestion(topic, type);

    response = response.replace(/```(?:json|markdown)?/gi, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error("Failed to parse response:", error);
      throw new Error("Invalid response format from AI");
    }
  }

  async checkAnswer(question: string, ans: string, type: string): Promise<QuestionsAnswerResponse | null> {
    try {
      const chatResponse = await this.client.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: 'user', content: this.messageToPromptForCheck(question, ans, type) }],
      });

      let rawContent = chatResponse.choices?.[0]?.message?.content;
      if (Array.isArray(rawContent)) {
        rawContent = rawContent.map(chunk => typeof chunk === 'string' ? chunk : '').join('');
      }
      if (typeof rawContent === 'string') {
        rawContent = rawContent.trim();
      } else {
        console.error("Unexpected content type in LLM response:", rawContent);
        return null;
      }

      // Attempt to extract JSON safely
      const jsonMatch = rawContent?.match(/\{[\s\S]*\}/); // Finds the first JSON-like block
      if (!jsonMatch) {
        console.error("No valid JSON found in LLM response:", rawContent);
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]) as QuestionsAnswerResponse;

      // Optional: validate fields
      if (
        typeof parsed.marks === 'number' &&
        typeof parsed.evaluation === 'string'
      ) {
        return parsed;
      } else {
        console.error("Parsed object has invalid structure:", parsed);
        return null;
      }

    } catch (error) {
      console.error("Error while checking answer:", error);
      return null;
    }
  }

  // Here i have to do Prompt Engineering 

  messageToPrompt(topic: string, type: string): string {
    if (type === 'mcq') {
      return `Generate 5 multiple-choice questions based on the topic "${topic}". Each should be in this JSON format:

\`\`\`json
[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "Madrid", "Paris", "Rome"],
    "answer": "Paris"
  }
]
\`\`\`

Only return valid JSON inside triple backticks. Do not include explanation or anything else.`;
    } else if (type === 'short') {
      return `Provide a short answer type question based on "${topic}" in this JSON format:

\`\`\`json
{
  "question": "Explain Newton's first law briefly.",
  "options": null,
  "answer": null
}
\`\`\`

Only return valid JSON inside triple backticks. Do not include explanation or anything else.`;
    } else {
      return `Provide a long answer type question based on "${topic}" in this JSON format:

\`\`\`json
{
  "question": "Describe the water cycle in detail.",
  "options": null,
  "answer": null
}
\`\`\`

Only return valid JSON inside triple backticks. Do not include explanation or anything else.`;
    }
  }

  messageToPromptForCheck(question: string, ans: string, type: string): string {
    if (type === 'short') {
      return `
You are an examiner evaluating a short-answer question worth 2 marks.

Question:
${question}

Student's Answer:
${ans}

Instructions:
- Evaluate the correctness and completeness of the answer.
- Consider key points, accuracy, and clarity.
- Assign a mark out of 2.
- Respond only with a JSON object like:
{ "evaluation": "Partially correct. Missed the key term.", "marks": 1 , "Answer": "Correct answer is: [correct answer here]" }

Do not explain more than required. Stick to the specified JSON format.
    `.trim();
    } else {
      return `
You are an examiner evaluating a long-answer question worth 7 marks.

Question:
${question}

Student's Answer:
${ans}

Instructions:
- Assess the answer thoroughly based on content coverage, structure, and relevance.
- Break down into step marking if possible (e.g., intro, explanation, examples, conclusion).
- Assign a mark out of 7.
- Respond only with a JSON object like:
{ "evaluation": "Well-structured answer covering all key points.", "marks": 6 , "Answer": "Correct answer is: [correct answer here]" }

Do not include anything other than this JSON object.
    `.trim();
    }
  }


}
