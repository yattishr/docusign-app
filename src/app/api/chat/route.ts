import { Configuration, OpenAIApi } from 'openai-edge';
import { Message } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { OramaClient } from '@/lib/orama';
import OpenAI from "openai"

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// const openai = new OpenAIApi(config);
const openai = new OpenAI();

export async function POST(req: Request) {
    try {

        // Check if the user is authorized to perform the action.
        const { userId } = await auth();
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Destructure the accountId and the messages from the request.
        const { accountId, messages } = await req.json();

        // Initialize Orama Client.
        const orama = new OramaClient(accountId);
        await orama.initialize();

        // Fetch the last message as context.
        const lastMessage = messages[messages.length - 1];
        console.log('--- Logging last message from Chat API: ', lastMessage);

        // Verify that Orama client is properly initialized.
        if (!orama) {
            throw new Error('Orama index is not initialized.');
        }

        // Pass the context into the Orama Vector search.
        const context = await orama.vectorSearch({ prompt: lastMessage.content });
        console.log('--- Logging Results: ', JSON.stringify(context));
        console.log('--- Logging context: ', context.hits.length + ' hits found ---');

        // Fallback handling when no context is found.
        let fallbackMessage = null;
        if (!context || context.hits.length === 0) {
            fallbackMessage = {
                role: 'assistant',
                content: "I'm sorry, I couldn't find any relevant information to help with your request. Could you provide more details or clarify?",
            };
        }


        // System prompt
        const prompt = {
            role: 'system',
            content: `You are an AI email assistant embedded in an email client app. 
            Your purpose is to help the user compose professional, clear, and effective 
            emails while maintaining appropriate tone and context.
            THE TIME NOW IS ${new Date().toLocaleString()}
            
            START CONTEXT BLOCK
            ${context?.hits
                .map((hit) => JSON.stringify(hit.document))
                .join('\n') || "No relevant context available."}
            END OF CONTEXT BLOCK
            
            When responding, please keep in mind:
            - Be helpful, clever, and articulate.
            - Rely on the provided email context to inform your responses.
            - If the context does not contain enough information to answer a question, politely say you don't have enough information.
            - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
            - Do not invent or speculate about anything that is not directly supported by the email context.
            - Keep your responses concise and relevant to the user's questions or the email being composed.`,
        };

        const userMessages = messages.filter((message: Message) => message.role)

        const finalMessages = [
            prompt,
            ...userMessages,
            ...(context.hits.length === 0 ? [fallbackMessage] : [])
        ];

        // console.log('Finale messages sent to OpenAI: ', finalMessages)

        // const response = await openai.createChatCompletion({
        //     model: 'gpt-3.5-turbo',
        //     messages: finalMessages,
        //     stream: true,
        // });

        // Check if the response is empty
        // if (!response || Object.keys(response).length === 0) {
        //     console.log('--- Empty response from OpenAI API ---');
        //     return new Response(
        //         JSON.stringify({
        //             role: 'assistant',
        //             content: fallbackMessage?.content || 'Something went wrong. Please try again later.',
        //         }),
        //         { status: 200 }
        //     );
        // }

        // console.log(`--- Logging the response from ChatCompletions: ${JSON.stringify(response)}`);

        // return response;

        // test OpenAI completions...
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant" },
                {
                    role: "user", content: "Write a limerick about Javascript programming."
                }
            ]
        })

        console.log(response.choices[0]?.message)
        return response

    } catch (error) {
        console.error('Error occurred in Chat API endpoint: ', error);
        return new Response('Internal server error', { status: 500 });
    }
}
