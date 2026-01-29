'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import SubscriptionCardDB from './SubscriptionCardDB';

interface SortableItemProps {
  subscription: Subscription;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ subscription, onToggleActive, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subscription.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical size={20} className="text-gray-400" />
      </div>
      <SubscriptionCardDB
        subscription={subscription}
        onToggleActive={onToggleActive}
        onDelete={onDelete}
      />
    </div>
  );
}

interface DraggableSubscriptionListProps {
  subscriptions: Subscription[];
  onReorder: (subscriptions: Subscription[]) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DraggableSubscriptionList({
  subscriptions,
  onReorder,
  onToggleActive,
  onDelete,
}: DraggableSubscriptionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = subscriptions.findIndex((s) => s.id === active.id);
      const newIndex = subscriptions.findIndex((s) => s.id === over.id);

      const newOrder = arrayMove(subscriptions, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={subscriptions.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 pl-8">
          {subscriptions.map((subscription) => (
            <SortableItem
              key={subscription.id}
              subscription={subscription}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
