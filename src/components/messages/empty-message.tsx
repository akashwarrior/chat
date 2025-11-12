"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useChatInputStore } from "@/store/chat-input-store";
import { useSession } from "@/lib/auth/auth-client";
import { TransitionPanel } from "../ui/transition-panel";
import { TextEffect } from "../ui/text-effect";
import type { LucideIcon } from "lucide-react";
import { Book, Code, Globe, Sparkles } from "lucide-react";

type Feature = {
  label: string;
  Icon: LucideIcon;
  prompts: readonly string[];
};

const FEATURES: readonly Feature[] = [
  {
    label: "Create",
    Icon: Sparkles,
    prompts: [
      "Write a short story about a robot discovering emotions",
      "Help me outline a sci-fi novel set in a post-apocalyptic world",
      "Create a character profile for a complex villain with sympathetic motives",
      "Give me 5 creative writing prompts for flash fiction",
    ],
  },
  {
    label: "Explore",
    Icon: Globe,
    prompts: [
      "Good books for fans of Rick Rubin",
      "Countries ranked by number of corgis",
      "Most successful companies in the world",
      "How much does Claude cost?",
    ],
  },
  {
    label: "Code",
    Icon: Code,
    prompts: [
      "Write code to invert a binary search tree in Python",
      "What's the difference between Promise.all and Promise.allSettled?",
      "Explain React's useEffect cleanup function",
      "Best practices for error handling in async/await",
    ],
  },
  {
    label: "Learn",
    Icon: Book,
    prompts: [
      "Beginner's guide to TypeScript",
      "Explain the CAP theorem in distributed systems",
      "Why is AI so expensive?",
      "Are black holes real?",
    ],
  },
] as const;

const PANEL_VARIANTS = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 364 : -364,
  }),
  center: {
    opacity: 1,
    x: 0,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    left: 0,
    opacity: 0,
    position: "absolute" as const,
    top: 0,
    width: "100%",
    x: direction < 0 ? 364 : -364,
    zIndex: 0,
  }),
} as const;

const PANEL_TRANSITION = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
} as const;

export default function EmptyMessage() {
  const { data: session } = useSession();
  const { input, setInput } = useChatInputStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const firstName = useMemo(
    () => session?.user?.name?.split(" ")[0] ?? "",
    [session?.user?.name],
  );

  const handleSetActiveIndex = useCallback(
    (index: number) => {
      if (index === activeIndex) {
        return;
      }

      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex],
  );

  const handlePromptSelect = useCallback(
    (prompt: string) => {
      setInput(prompt);
    },
    [setInput],
  );

  if (input) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-1 flex-col justify-center gap-8 pt-20 sm:gap-6"
      exit={{ opacity: 0, y: 30 }}
      initial={{ opacity: 0, y: 30 }}
    >
      <HeroHeading firstName={firstName} />

      <FeatureTabs
        activeIndex={activeIndex}
        features={FEATURES}
        onSelect={handleSetActiveIndex}
      />

      <TransitionPanel
        activeIndex={activeIndex}
        custom={direction}
        transition={PANEL_TRANSITION}
        variants={PANEL_VARIANTS}
      >
        {FEATURES.map((feature) => (
          <FeaturePrompts
            feature={feature}
            key={feature.label}
            onSelectPrompt={handlePromptSelect}
          />
        ))}
      </TransitionPanel>
    </motion.div>
  );
}

function HeroHeading({ firstName }: { firstName: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-3xl font-bold">
      <span className="flex">How can I help you{firstName ? "," : ""}</span>
      {firstName ? (
        <span className="flex">
          <TextEffect className="flex" per="char" preset="slide">
            {firstName}
          </TextEffect>
          ?
        </span>
      ) : (
        <span className="flex">today?</span>
      )}
    </div>
  );
}

type FeatureTabsProps = {
  activeIndex: number;
  features: readonly Feature[];
  onSelect: (index: number) => void;
};

function FeatureTabs({ activeIndex, features, onSelect }: FeatureTabsProps) {
  return (
    <div className="sm:flex sm:gap-4 gap-2 grid grid-cols-4">
      {features.map((feature, index) => {
        const isActive = index === activeIndex;

        return (
          <Button
            key={feature.label}
            aria-pressed={isActive}
            className="rounded-xl sm:rounded-full px-6! py-4.5! border flex gap-1 sm:gap-2"
            onClick={() => onSelect(index)}
            type="button"
            variant={isActive ? "default" : "outline"}
          >
            <feature.Icon className="hidden size-4 sm:block" />
            <span>{feature.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

type FeaturePromptsProps = {
  feature: Feature;
  onSelectPrompt: (prompt: string) => void;
};

function FeaturePrompts({ feature, onSelectPrompt }: FeaturePromptsProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {feature.prompts.map((prompt) => (
        <Button
          key={`${feature.label}-${prompt}`}
          className="flex items-center text-wrap! justify-start text-start py-2.5 px-3 font-normal tracking-wider h-auto"
          onClick={() => onSelectPrompt(prompt)}
          type="button"
          variant="ghost"
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}
