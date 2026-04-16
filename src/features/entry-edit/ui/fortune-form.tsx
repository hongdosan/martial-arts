import type { Fortune, FortuneSub } from '../../../entities/fortune';
import type { DetailEntry } from '../../../shared/lib';
import { TextField, PairListField } from '../../../shared/ui';

interface FortuneFormProps {
  value: Fortune;
  onPatch: (patch: Partial<Fortune>) => void;
}

export const FortuneForm = ({ value, onPatch }: FortuneFormProps) => (
  <>
    <TextField
      label="분류"
      value={value.sub}
      onChange={(v) => onPatch({ sub: v as FortuneSub })}
      placeholder="영약, 영물, 신병이기"
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
