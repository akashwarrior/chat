import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Book, Code, Globe, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";

export default async function Home() {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <div className="w-full max-w-2xl m-auto flex flex-col gap-8 sm:gap-6 px-6 md:px-10">
      <h1 className="text-3xl font-bold">
        How can I help you{user?.name ? `, ${user.name.split(" ")[0]}` : ""}?
      </h1>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="bg-transparent mb-8 sm:mb-5 gap-4 flex items-center justify-around w-full sm:justify-start flex-wrap h-auto">
          <TabTrigger value="create">
            <Sparkles /> Create
          </TabTrigger>

          <TabTrigger value="explore">
            <Globe /> Explore
          </TabTrigger>

          <TabTrigger value="code">
            <Code /> Code
          </TabTrigger>

          <TabTrigger value="learn">
            <Book /> Learn
          </TabTrigger>

        </TabsList>

        <TabContent
          value="create"
          contents={[
            "Write a short story about a robot discovering emotions",
            "Help me outline a sci-fi novel set in a post-apocalyptic world",
            "Create a character profile for a complex villain with sympathetic motives",
            "Give me 5 creative writing prompts for flash fiction",
          ]}
        />

        <TabContent
          value="explore"
          contents={[
            "Good books for fans of Rick Rubin",
            "Countries ranked by number of corgis",
            "Most successful companies in the world",
            "How much does Claude cost?",
          ]}
        />
        <TabContent
          value="code"
          contents={[
            "Write code to invert a binary search tree in Python",
            "What's the difference between Promise.all and Promise.allSettled?",
            "Explain React's useEffect cleanup function",
            "Best practices for error handling in async/await",
          ]}
        />

        <TabContent
          value="learn"
          contents={[
            "Beginner's guide to TypeScript",
            "Explain the CAP theorem in distributed systems",
            "Why is AI so expensive?",
            "Are black holes real?",
          ]}
        />

      </Tabs>
    </div>
  );
}


function TabTrigger({ children, value }: { children: React.ReactNode, value: string }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "rounded-lg! sm:!rounded-full sm:px-6! flex items-center gap-1! sm:gap-2! flex-col sm:flex-row h-auto! p-3! sm:py-2! sm:max-w-fit",
        buttonVariants({ variant: "outline" }),
        "data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground!",
      )}
    >
      {children}
    </TabsTrigger>
  );
}


function TabContent({ contents, value }: { contents: string[], value: string }) {
  return (
    <TabsContent className="flex flex-col w-full gap-2" value={value}>
      {contents.map((content, index) => (
        <Button
          key={index}
          variant="ghost"
          className="flex items-center text-wrap! justify-start text-start py-2.5 px-3 font-normal tracking-wider h-auto"
        >
          {content}
        </Button>
      ))}
    </TabsContent>
  );
}