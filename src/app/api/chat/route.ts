import { DEFAULT_MODEL, getModelConfig } from "@/ai/config";
import { convertToModelMessages, smoothStream, streamText } from "ai";

export async function POST(request: Request) {
    try {
        const { messages, modelId = DEFAULT_MODEL } = await request.json();

        const result = streamText({
            ...getModelConfig(modelId),
            messages: convertToModelMessages(messages),
            experimental_transform: smoothStream({ chunking: "word" }),
        });
        return result.toUIMessageStreamResponse({
            sendReasoning: true,
        })
    } catch (error) {
        console.error("Unhandled error in chat API:", error);
        return new Response("Oops, an error occurred!", { status: 500 });
    }
}