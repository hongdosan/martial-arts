import type { Misc } from '../model/types';
import { DetailCard } from '../../../shared/ui';

interface MiscCardProps {
  misc: Misc;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const MiscCard = ({ misc, expanded, onToggle, onEdit }: MiscCardProps) => (
  <DetailCard
    data={{
      id: misc.id,
      name: misc.name,
      tag: misc.tag,
      desc: misc.desc,
      details: misc.details,
      notes: misc.notes,
    }}
    expanded={expanded}
    onToggle={onToggle}
    onEdit={onEdit}
  />
);
