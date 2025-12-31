import { google } from "@ai-sdk/google";

export type GoogleModels = Parameters<typeof google>[0];

type ModelId = GoogleModels;

interface Model {
  id: ModelId;
  name: string;
  provider: string;
  description: string;
}

export const AVAILABLE_MODELS = [
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

export const AVAILABLE_MODEL_IDS = AVAILABLE_MODELS.map(
  (model) => model.id,
) as [
  (typeof AVAILABLE_MODELS)[number]["id"],
  ...(typeof AVAILABLE_MODELS)[number]["id"][],
];

const AVAILABLE_MODELS_BY_ID = new Map(
  AVAILABLE_MODELS.map((model) => [model.id, model]),
);

export const DEFAULT_MODEL: (typeof AVAILABLE_MODELS)[number]["id"] =
  "gemini-2.5-flash-lite";

export function getAvailableModels() {
  return AVAILABLE_MODELS;
}

export function getModelConfig(modelId = DEFAULT_MODEL) {
  const resolvedModelId = AVAILABLE_MODELS_BY_ID.has(modelId)
    ? modelId
    : DEFAULT_MODEL;

  return {
    model: google(resolvedModelId),
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
