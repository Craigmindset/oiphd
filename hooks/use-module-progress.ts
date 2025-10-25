"use client";

import { useState, useEffect } from "react";

const MODULES = ["module1", "module2", "module3", "prayers", "transformation"];
const STORAGE_KEY = "moduleProgress";

export function useModuleProgress() {
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  useEffect(() => {
    // Load saved progress from localStorage on mount
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      setCompletedModules(JSON.parse(savedProgress));
    }
  }, []);

  const markModuleComplete = (moduleId: string) => {
    const updatedModules = [...new Set([...completedModules, moduleId])];
    setCompletedModules(updatedModules);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedModules));
  };

  const markModuleIncomplete = (moduleId: string) => {
    const updatedModules = completedModules.filter((id) => id !== moduleId);
    setCompletedModules(updatedModules);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedModules));
  };

  const getProgress = () => {
    const totalModules = MODULES.length;
    const completedCount = completedModules.length;
    return Math.round((completedCount / totalModules) * 100);
  };

  const isModuleCompleted = (moduleId: string) => {
    return completedModules.includes(moduleId);
  };

  return {
    completedModules,
    markModuleComplete,
    markModuleIncomplete,
    getProgress,
    isModuleCompleted,
  };
}
