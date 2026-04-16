import { useCallback, useState } from 'react';
import type { HasId } from '../../../shared/lib';

export interface DragReorderApi {
  dragId: string | null;
  overId: string | null;
  bindItem: (id: string) => {
    draggable: true;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
  };
}

export const useDragReorder = <T extends HasId>(
  items: T[],
  onReorder: (next: T[]) => void,
): DragReorderApi => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const doDrop = useCallback(
    (targetId: string) => {
      if (!dragId || dragId === targetId) return;
      const copy = items.slice();
      const from = copy.findIndex((x) => x.id === dragId);
      const to = copy.findIndex((x) => x.id === targetId);
      if (from < 0 || to < 0) return;
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      onReorder(copy);
    },
    [dragId, items, onReorder],
  );

  const bindItem = useCallback(
    (id: string) => ({
      draggable: true as const,
      onDragStart: (e: React.DragEvent) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        setOverId((prev) => (prev === id ? prev : id));
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        doDrop(id);
        setDragId(null);
        setOverId(null);
      },
      onDragEnd: () => {
        setDragId(null);
        setOverId(null);
      },
    }),
    [doDrop],
  );

  return { dragId, overId, bindItem };
};
