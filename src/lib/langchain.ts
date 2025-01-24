"use server"
import { OramaClient } from "@/lib/orama";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function handleStreaming(input: string, accountId: string): Promise<ReadableStream> {
  // Initialize Orama Client.
  const orama = new OramaClient(accountId);
  await orama.initialize();

  // Fetch the last message as context.
  const lastMessage = input;
  console.log('--- Logging last message from Chat API: ', lastMessage);

  // Pass the context into the Orama Vector search.
  const context = await orama.vectorSearch({ prompt: lastMessage });
  console.log('--- Logging context: ', context.hits.length + ' hits found ---');

  // Fallback handling when no context is found.
  const fallbackMessage =
    context.hits.length === 0
      ? "I'm sorry, I couldn't find any relevant information to help with your request. Could you provide more details or clarify?"
      : "";

  // Prepare messages for LangChain model.
  const systemMessage = new SystemMessage(`
    You are an AI email assistant embedded in an email client app. 
    Your purpose is to help the user compose professional, clear, and effective emails while maintaining appropriate tone and context.
    THE TIME NOW IS ${new Date().toLocaleString()}

    START CONTEXT BLOCK
    ${
      context?.hits.map((hit) => JSON.stringify(hit.document)).join("\n") ||
      "No relevant context available."
    }
    END OF CONTEXT BLOCK

    When responding, please keep in mind:
    - Be helpful, clever, and articulate.
    - Rely on the provided email context to inform your responses.
    - If the context does not contain enough information to answer a question, politely say you don't have enough information.
    - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
    - Do not invent or speculate about anything that is not directly supported by the email context.
    - Keep your responses concise and relevant to the user's questions or the email being composed.

    ${fallbackMessage}
  `);

  const userMessage = new HumanMessage(lastMessage);

  // Initialize LangChain's ChatOpenAI model with streaming enabled.
  const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
    streaming: true, // Enable streaming
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Stream individual tokens back to the client.
  const stream = await model.stream([systemMessage, userMessage]);

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (typeof chunk.content === 'string') {
          controller.enqueue(encoder.encode(chunk.content));
        } else {
          console.error('Unexpected chunk content type:', typeof chunk.content);
        }
      }
      controller.close();
    },
  });

  return readableStream;
}