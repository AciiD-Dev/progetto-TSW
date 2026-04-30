"use client";

import React, { createContext, useContext, useState } from 'react';
import { SequenceStep } from '@/types';

interface EditorContextType {
  steps: SequenceStep[];
  setSteps: React.Dispatch<React.SetStateAction<SequenceStep[]>>;
  selectedStepId: string | null;
  setSelectedStepId: (id: string | null) => void;
  updateStep: (id: string, updates: Partial<SequenceStep>) => void;
  removeStep: (id: string) => void;
  draggedItemIndex: number | null;
  setDraggedItemIndex: (index: number | null) => void;
  moveStep: (fromIndex: number, toIndex: number) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children, initialSteps }: { children: React.ReactNode, initialSteps: SequenceStep[] }) {
  const [steps, setSteps] = useState<SequenceStep[]>(initialSteps);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const updateStep = (id: string, updates: Partial<SequenceStep>) => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, ...updates } : step));
  };

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(step => step.id !== id));
    if (selectedStepId === id) setSelectedStepId(null);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    setSteps(prev => {
      const newSteps = [...prev];
      const draggedItem = newSteps[fromIndex];
      newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, draggedItem);
      return newSteps;
    });
  };

  return (
    <EditorContext.Provider value={{
      steps, setSteps,
      selectedStepId, setSelectedStepId,
      updateStep, removeStep,
      draggedItemIndex, setDraggedItemIndex, moveStep
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
}
