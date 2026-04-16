import type { Title } from '../../../entities/title';
import type { MemberEntry } from '../../../shared/lib';
import { TextField, PairListField } from '../../../shared/ui';

interface TitleFormProps {
  value: Title;
  onPatch: (patch: Partial<Title>) => void;
}

export const TitleForm = ({ value, onPatch }: TitleFormProps) => (
  <>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField
      label="태그/계열"
      value={value.tag}
      onChange={(v) => onPatch({ tag: v })}
      placeholder="예: 강함 기준, 직위..."
    />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <PairListField
      label="구성원"
      keyLeft="n"
      keyRight="d"
      value={value.members}
      onChange={(v) => onPatch({ members: v as MemberEntry[] })}
      placeholderLeft="이름"
      placeholderRight="설명"
    />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);
