"use client";
import { useState } from "react";
import { Module1 } from "@/components/dashboard/module-1";
import { Button } from "@/components/ui/button";
import { useModuleProgress } from "@/hooks/use-module-progress";
import { CheckCircle, Circle } from "lucide-react";

export default function Module1Page() {
  const { isModuleCompleted, markModuleComplete, markModuleIncomplete } =
    useModuleProgress();
  const moduleId = "module1";
  const completed = isModuleCompleted(moduleId);
  const [allCardsOpened, setAllCardsOpened] = useState(false);

  const toggleCompletion = () => {
    if (completed) {
      markModuleIncomplete(moduleId);
    } else {
      markModuleComplete(moduleId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Module 1</h1>
        <Button
          variant={completed ? "outline" : "default"}
          onClick={toggleCompletion}
          className="flex items-center gap-2"
          disabled={!allCardsOpened}
          title={
            !allCardsOpened
              ? "Open all cards to complete the module"
              : undefined
          }
        >
          {completed ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Completed
            </>
          ) : (
            <>
              <Circle className="w-5 h-5" />
              Mark as Complete
            </>
          )}
        </Button>
      </div>
      <Module1 onAllCardsOpened={setAllCardsOpened} />
    </div>
  );
}
// ...existing code...
