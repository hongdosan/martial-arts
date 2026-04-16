import type { Level, LevelSub } from '../../../entities/level';
import { TextField, TagField } from '../../../shared/ui';

interface LevelFormProps {
  value: Level;
  onPatch: (patch: Partial<Level>) => void;
}

export const LevelForm = ({ value, onPatch }: LevelFormProps) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <TextField
        label="분류"
        value={value.sub}
        onChange={(v) => onPatch({ sub: v as LevelSub })}
        placeholder="경지, 검도, 성취, 방어, 공격"
      />
      <TextField
        label="순위"
        value={value.rank}
        onChange={(v) => onPatch({ rank: v })}
        placeholder="숫자(선택)"
      />
    </div>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TagField label="별칭" value={value.aliases} onChange={(v) => onPatch({ aliases: v })} />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <TextField
      label="조건/특이사항"
      value={value.conditions}
      onChange={(v) => onPatch({ conditions: v })}
      multiline
    />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);
