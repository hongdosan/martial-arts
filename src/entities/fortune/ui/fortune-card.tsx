import type { Fortune } from '../model/types';
import { DetailCard } from '../../../shared/ui';

interface FortuneCardProps {
  fortune: Fortune;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const FortuneCard = ({ fortune, expanded, onToggle, onEdit }: FortuneCardProps) => (
  <DetailCard
    data={{
      id: fortune.id,
      name: fortune.name,
      tag: fortune.tag,
      desc: fortune.desc,
      details: fortune.details,
      notes: fortune.notes,
    }}
    expanded={expanded}
    onToggle={onToggle}
    onEdit={onEdit}
  />
);
