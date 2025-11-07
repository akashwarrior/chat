import { google } from "@ai-sdk/google";

export type GoogleModels = Parameters<typeof google>[0];

export const DEFAULT_MODEL: ReturnType<typeof getAvailableModels>[number]["id"] = "gemini-2.5-flash-lite";

interface Model {
    id: GoogleModels;
    name: string;
    description: string;
}

export function getAvailableModels() {
    return [
        {
            id: "gemini-2.5-pro",
            name: "Gemini Pro",
            description: "The most powerful model in the Gemini family",
        },
        {
            id: "gemini-2.5-flash",
            name: "Gemini Flash",
            description: "A lighter version of Gemini 2.5 flash",
        },
        {
            id: "gemini-2.5-flash-lite",
            name: "Gemini Flash Lite",
            description: "A lighter version of Gemini 2.5 flash",
        },
    ] as const satisfies Model[];
}

export function getModelConfig(modelId = DEFAULT_MODEL) {
    return {
        model: google(modelId),
        providerOptions: {
            google: {
                thinkingConfig: {
                    thinkingBudget: -1,
                    includeThoughts: true,
                },
            },
        },
    };
}