'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableMetricCard from './SortableMetricCard';

interface Card {
  id: string;
  props: Record<string, any>;
}

interface MetricCardsSectionProps {
  cards: Card[];
  avgTemp: string;
  devicesOn: number;
  avgHum: string;
  activeAlerts: number;
  onCardsChange: (cards: Card[]) => void;
}

export default function MetricCardsSection({
  cards,
  avgTemp,
  devicesOn,
  avgHum,
  activeAlerts,
  onCardsChange,
}: MetricCardsSectionProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((i) => i.id === active.id);
      const newIndex = cards.findIndex((i) => i.id === over.id);
      const newArray = arrayMove(cards, oldIndex, newIndex);
      localStorage.setItem('homehub-metric-cards', JSON.stringify(newArray.map(c => c.id)));
      onCardsChange(newArray);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cards.map(c => c.id)} strategy={horizontalListSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map(card => {
            if (card.id === 'temp') return <SortableMetricCard key={card.id} id={card.id} value={avgTemp} {...card.props} />;
            if (card.id === 'power') return <SortableMetricCard key={card.id} id={card.id} value={devicesOn} {...card.props} />;
            if (card.id === 'humidity') return <SortableMetricCard key={card.id} id={card.id} value={avgHum} {...card.props} />;
            if (card.id === 'alerts') return <SortableMetricCard key={card.id} id={card.id} value={activeAlerts} description={activeAlerts > 0 ? "Action required" : "No issues detected"} {...card.props} color={activeAlerts > 0 ? "error" : "tertiary"} />;
            return null;
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
