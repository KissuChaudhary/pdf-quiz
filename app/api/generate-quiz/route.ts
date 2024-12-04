import { questionSchema, questionsSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import * as z from 'zod';

export const maxDuration = 60;

const enhancedQuestionSchema = questionSchema.extend({
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const enhancedQuestionsSchema = z.array(enhancedQuestionSchema).length(4);

export async function POST(req: Request) {
  const { files, difficulty = 'medium' } = await req.json();
  const firstFile = files[0].data;

  const result = await streamObject({
    model: google("gemini-1.5-flash"),
    messages: [
      {
        role: "system",
        content:
          "You are a teacher. Your job is to take a document, and create a multiple choice test (with 4 questions) based on the content of the document. Each option should be roughly equal in length.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create a multiple choice test based on this document.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: enhancedQuestionSchema,
    output: "array",
    onFinish: ({ object }) => {
      const res = enhancedQuestionsSchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return result.toTextStreamResponse();
}

