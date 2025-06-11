import { google } from '@ai-sdk/google';
import { streamText, type Message } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: Message[] } = await req.json();

    const result = streamText({
        model: google('gemma-3-27b-it'),
        messages,
    });

    return result.toDataStreamResponse();
}