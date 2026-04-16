import type { Faction } from '../../../entities/faction';
import type { MemberGroup } from '../../../shared/lib';
import { TextField, GroupField } from '../../../shared/ui';

interface FactionFormProps {
  value: Faction;
  onPatch: (patch: Partial<Faction>) => void;
}

export const FactionForm = ({ value, onPatch }: FactionFormProps) => (
  <>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField
      label="태그/계열"
      value={value.tag}
      onChange={(v) => onPatch({ tag: v })}
      placeholder="예: 정파, 소림사..."
    />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <GroupField
      label="소속 그룹 / 구성원"
      value={value.groups}
      onChange={(v) => onPatch({ groups: v as MemberGroup[] })}
    />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);
