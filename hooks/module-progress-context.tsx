"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";

const MODULES = ["module1", "module2", "module3", "prayers", "transformation"];

interface ModuleProgressContextType {
  completedModules: string[];
  markModuleComplete: (moduleId: string) => Promise<void>;
  markModuleIncomplete: (moduleId: string) => Promise<void>;
  getProgress: () => number;
  isModuleCompleted: (moduleId: string) => boolean;
}

const ModuleProgressContext = createContext<
  ModuleProgressContextType | undefined
>(undefined);

export function ModuleProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  async function fetchCompletedModules() {
    if (!user) return;
    const { data } = await supabase
      .from("module_progress")
      .select("module_id, completed")
      .eq("user_id", user.id)
      .eq("completed", true);
    if (data) {
      setCompletedModules(data.map((row: any) => row.module_id));
    }
  }

  useEffect(() => {
    fetchCompletedModules();
    // Optionally, add polling or a subscription for real-time updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markModuleComplete = async (moduleId: string) => {
    if (!user) return;
    await supabase.from("module_progress").upsert({
      user_id: user.id,
      module_id: moduleId,
      completed: true,
    });
    fetchCompletedModules();
  };

  const markModuleIncomplete = async (moduleId: string) => {
    if (!user) return;
    await supabase.from("module_progress").upsert({
      user_id: user.id,
      module_id: moduleId,
      completed: false,
    });
    fetchCompletedModules();
  };

  const getProgress = () => {
    const totalModules = MODULES.length;
    const completedCount = completedModules.length;
    return Math.round((completedCount / totalModules) * 100);
  };

  const isModuleCompleted = (moduleId: string) => {
    return completedModules.includes(moduleId);
  };

  return (
    <ModuleProgressContext.Provider
      value={{
        completedModules,
        markModuleComplete,
        markModuleIncomplete,
        getProgress,
        isModuleCompleted,
      }}
    >
      {children}
    </ModuleProgressContext.Provider>
  );
}

export function useModuleProgress() {
  const context = useContext(ModuleProgressContext);
  if (!context) {
    throw new Error(
      "useModuleProgress must be used within a ModuleProgressProvider"
    );
  }
  return context;
}
