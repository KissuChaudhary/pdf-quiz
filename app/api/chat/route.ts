import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    system:
      "You are a teacher. The user will give you a PDF file and you will have to extract the text from it. You will then have to generate a list of four multiple choice questions, providing four possible answers (while marking the correct answer). The user will then have to answer the questions.",
    messages,
  });

  return result.toDataStreamResponse();
}
