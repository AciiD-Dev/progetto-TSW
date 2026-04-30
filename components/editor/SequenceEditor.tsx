import React, { useState, useEffect, useId } from 'react';
import { NodeBlock } from './NodeBlock';
import { useEditor } from '@/components/editor/EditorContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function SequenceEditor() {
  const { 
    steps,
    moveStep 
  } = useEditor();
  
  const [isMounted, setIsMounted] = useState(false);
  const dndId = useId();

  // Fix Hydration Mismatch by ensuring dnd-kit only runs on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over.id);
      moveStep(oldIndex, newIndex);
    }
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Robust vertical-only modifier
  const restrictToVerticalAxis = ({ transform }: any) => {
    return {
      ...transform,
      x: 0,
    };
  };

  if (!isMounted) {
    return (
      <main className="relative overflow-y-auto h-full w-full no-scrollbar">
        <div className="max-w-2xl mx-auto py-8 lg:py-12 px-6 md:px-12 lg:px-8 min-h-full flex flex-col items-center spine-line relative">
          <div className="w-full text-center mb-10 lg:mb-12 z-10 px-2 opacity-50">
            <h1 className="headline-font text-2xl lg:text-3xl font-bold text-on-surface mb-2">Climate Control System</h1>
            <p className="text-on-surface-variant text-xs lg:text-sm tracking-wide">Initializing Engine...</p>
          </div>
        </div>
      </main>
    );
  }

  const activeStep = steps.find(s => s.id === activeId);

  return (
    <main className="relative overflow-y-auto h-full w-full no-scrollbar">
      <div className="max-w-2xl mx-auto py-8 lg:py-12 px-6 md:px-12 lg:px-8 min-h-full flex flex-col items-center spine-line relative">

        <div className="w-full text-center mb-10 lg:mb-12 z-10 px-2">
          <h1 className="headline-font text-2xl lg:text-3xl font-bold text-on-surface mb-2">Climate Control System</h1>
          <p className="text-on-surface-variant text-xs lg:text-sm tracking-wide">Automation Sequence • {steps.length} Active Steps</p>
        </div>

        <DndContext 
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext 
            items={steps.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="w-full space-y-10 lg:space-y-12 relative z-10 mb-20 lg:mb-8">
              {steps.map((step, index) => (
                <NodeBlock
                  key={step.id}
                  data={step}
                  index={index}
                  isLast={index === steps.length - 1}
                />
              ))}

              <div className="flex justify-center pt-8">
                <button className="flex items-center gap-3 px-6 py-3 rounded-full border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all group bg-surface shadow-lg">
                  <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span>
                  <span className="font-semibold text-sm">Insert next step</span>
                </button>
              </div>
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeId && activeStep ? (
              <div className="w-full max-w-[calc(100vw-3rem)] md:max-w-2xl">
                <NodeBlock data={activeStep} index={-1} isDraggingOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

      </div>
    </main>
  );
}
