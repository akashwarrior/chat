import { google } from "@ai-sdk/google";

export type GoogleModels = Parameters<typeof google>[0];

export const DEFAULT_MODEL: ReturnType<
  typeof getAvailableModels
>[number]["id"] = "gemini-2.5-flash-lite" as const;

interface Model {
  id: GoogleModels;
  name: string;
  provider: string;
  description: string;
}

export function getAvailableModels() {
  return [
    {
      id: "gemini-2.5-pro",
      name: "Gemini Pro",
      provider: "Google",
      description: "The most powerful model in the Gemini family",
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini Flash",
      provider: "Google",
      description: "The fastest model in the Gemini family",
    },
    {
      id: "gemini-2.5-flash-lite",
      name: "Gemini Flash Lite",
      provider: "Google",
      description: "The lightest model in the Gemini family",
    },
  ] as const satisfies Model[];
}

export function getModelConfig(modelId = DEFAULT_MODEL) {
  return {
    model: google(
      getAvailableModels().find((model) => model.id === modelId)?.id ||
        DEFAULT_MODEL,
    ),
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
