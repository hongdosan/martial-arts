import type { ReactNode } from 'react';
import type { DragReorderApi } from '../../../features/entry-reorder';

interface DraggableRowProps {
  id: string;
  reorder: DragReorderApi;
  children: ReactNode;
}

export const DraggableRow = ({ id, reorder, children }: DraggableRowProps) => {
  const { dragId, overId, bindItem } = reorder;
  const isDragging = dragId === id;
  const isOver = overId === id && !!dragId && dragId !== id;
  return (
    <div
      {...bindItem(id)}
      style={{
        opacity: isDragging ? 0.3 : 1,
        borderTop: isOver ? '2px solid #378ADD' : '2px solid transparent',
        transition: 'opacity 0.15s',
        cursor: dragId ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </div>
  );
};
