import { Injectable } from '@angular/core';
import { QuestionResponse, QuestionsAnswerResponse } from '.././app.component';
import { Mistral } from "@mistralai/mistralai";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  apiKey = environment.MISTRAL_API_KEY;

  client = new Mistral({ apiKey: this.apiKey });

  constructor() {
  }

  async getQuestion(topic: string, examType: string, questionsHistory: string, hardness: number): Promise<any> {
    const chatResponse = await this.client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: 'user', content: this.messageToPrompt(topic, examType, questionsHistory, hardness) }],
    });
    return chatResponse.choices?.[0]?.message?.content || null;
  }

  // Here i have to create 3 methods. 
  // 1 for - Fetch mcq quetion according to topic
  // 2 for - Fetch a quetion (Short / Long)
  // 3 for - Check the answer is correct or not

  async Question(topic: string, type: string, questionsHistory: string, hardness: number): Promise<QuestionResponse | QuestionResponse[]> {
    let response = await this.getQuestion(topic, type, questionsHistory, hardness);

    response = response.replace(/```(?:json|markdown)?/gi, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(response);
      console.log(parsed);
      return parsed;
    } catch (error) {
      console.error("Failed to parse response:", error);
      throw new Error("Invalid response format from AI");
    }
  }

  async checkAnswer(question: string, ans: string, type: string, hardness: number): Promise<QuestionsAnswerResponse | null> {
    try {
      const chatResponse = await this.client.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: 'user', content: this.messageToPromptForCheck(question, ans, type, hardness) }],
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

  messageToPrompt(topic: string, type: string, questionsHistory: string, hardness: number): string {
    const isProgrammingTopic = /code|programming|algorithm|Java|Python|C\+\+|JavaScript|TypeScript|Spring|Angular/i.test(topic);
    
    const baseInstruction = `Avoid repeating questions from this history:\n${questionsHistory}\nGenerate questions with a difficulty level of ${hardness}/10.`;

    const codeInstruction =
      isProgrammingTopic && hardness >= 8
        ? ` As the topic is programming-related and the difficulty is maximum, code-based content should be prioritized. 
For MCQs, up to 40% of questions may include code snippets. 
For short and long answer types, prefer questions that involve writing, analyzing, or debugging code. 
If code is provided, ensure it is correct. Penalize the student for incorrect logic or poor explanation.`
        : "";

    if (type === 'mcq') {
      return `${baseInstruction}${codeInstruction}
Generate 5 multiple-choice questions based on the topic "${topic}". Each question should reflect the specified difficulty level. Use the following JSON format:

\`\`\`json
[
  {
    "question": "What is the output of the following Java code snippet?",
    "code": "public class Test {\\n  public static void main(String[] args) {\\n    int x = 10;\\n    System.out.println(x++ + ++x);\\n  }\\n}",
    "options": ["10", "20", "30", "Compilation Error"],
    "answer": "20"
  }
]
\`\`\`

Only return valid JSON inside triple backticks. Do not include explanation or anything else.`;
    }

    if (type === 'short') {
      return `${baseInstruction}${codeInstruction}
Provide a short answer type question based on the topic "${topic}". Use the following JSON format:

\`\`\`json
{
  "question": "Explain Newton's first law briefly.",
  "code": null,
  "options": null,
  "answer": null
}
\`\`\`

Only return valid JSON inside triple backticks. Do not include explanation or anything else.`;
    }

    // Default to 'long'
    return `${baseInstruction}${codeInstruction}
Provide a long answer type question based on the topic "${topic}". The depth and complexity should match a difficulty level of ${hardness}/10. If the topic is programming-related, the question must involve writing or analyzing code.

Use the following JSON format:

\`\`\`json
{
  "question": "Describe the water cycle in detail.",
  "code": null,
  "options": null,
  "answer": null
}
\`\`\`

Only return valid JSON inside triple backticks. Do not include explanation or anything else.`;
  }


  messageToPromptForCheck(question: string, ans: string, type: string, hardness: number): string {
    const isStrict = hardness >= 8;
    const isLenient = hardness <= 3;
    let markingTone: string;
    if (isStrict) {
      markingTone = "Be very strict. Penalize for incomplete structure, missing points, or vague answers.";
    } else if (isLenient) {
      markingTone = "Be lenient. Allow partial credit for effort or partially correct points.";
    } else {
      markingTone = "Use balanced judgment. Consider clarity, correctness, and structure.";
    }

    const marks = type === "short" ? 2 : 7;
    const format = `{
  "evaluation": "[Your brief evaluation]",
  "marks": [0 to ${marks}],
  "Answer": "Correct answer is: [correct answer here]"
}`;

    const instructions = `
You are an examiner evaluating a ${type === "short" ? "short-answer" : "long-answer"} question worth ${marks} marks.

Question:
${question}

Student's Answer:
${ans}

Instructions:
- Evaluate based on the level of hardness: ${hardness}/10.
- ${markingTone}
- Assign a mark out of ${marks}.
- Respond only in this strict JSON format:
${format}

Do not explain more than required. Do not include anything outside the JSON object.
  `.trim();

    return instructions;
  }

}
