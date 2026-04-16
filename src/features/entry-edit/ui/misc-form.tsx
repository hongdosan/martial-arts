import type { Misc, MiscSub } from '../../../entities/misc';
import type { DetailEntry } from '../../../shared/lib';
import { TextField, PairListField } from '../../../shared/ui';

interface MiscFormProps {
  value: Misc;
  onPatch: (patch: Partial<Misc>) => void;
}

export const MiscForm = ({ value, onPatch }: MiscFormProps) => (
  <>
    <TextField
      label="분류"
      value={value.sub}
      onChange={(v) => onPatch({ sub: v as MiscSub })}
      placeholder="내공 이론, 무공 범주, 증상, 기타"
    />
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField label="태그/계열" value={value.tag} onChange={(v) => onPatch({ tag: v })} />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <PairListField
      label="상세 항목"
      keyLeft="l"
      keyRight="t"
      value={value.details}
      onChange={(v) => onPatch({ details: v as DetailEntry[] })}
      placeholderLeft="레이블"
      placeholderRight="내용"
    />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);
