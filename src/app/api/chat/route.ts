import { Configuration, OpenAIApi} from 'openai-edge'
import { Message } from 'ai'
import { auth } from '@clerk/nextjs/server'
import { OramaClient } from '@/lib/orama'

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,    
})

const openai = new OpenAIApi(config)

export async function POST(req:Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new Response('Unauthorised', { status: 401})
        }
        const { accountId, messages } = await req.json()
        const orama = new OramaClient(accountId)
        await orama.initialize()
        const lastMessage = messages[messages.length - 1]
        console.log('--- Logging last message from Chat API: ', lastMessage)
        const context = await orama.vectorSearch({term: lastMessage.content})
        console.log('--- Logging context: ', context.hits.length + ' hits found ---')

        // System prompt
        const prompt = {
            role: "system",
            content: `You are an AI email assistant embedded in an email client app. 
            Your purpose is to help the user compose professional, clear, and effective 
            emails while maintaining appropriate tone and context.
            THE TIME NOW IS ${new Date().toLocaleString()}
        
        
            START CONTEXT BLOCK
            ${context.hits.map((hit) => JSON.stringify(hit.document)).join('\n')}
            END OF CONTEXT BLOCK
        
            When responding, please keep in mind:
            - Be helpful, clever, and articulate.
            - Rely on the provided email context to inform your responses.
            - If the context does not contain enough information to answer a question, politely say you don't have enough information.
            - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
            - Do not invent or speculate about anything that is not directly supported by the email context.
            - Keep your responses concise and relevant to the user's questions or the email being composed.`
        }

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [prompt, ...messages.filter((message: Message )=> message.role == 'user')],
            stream: true
        })

        // We dont have OpenAIStream available so we dump the response into 'stream' for now.
        // const stream = response
        return response

        // return new Response('OK', {status: 200})

    } catch (error) {
        console.error('Error occured in Chat API endpoint: ', error)
        return new Response('Internal server error', {status: 500})
    }
}