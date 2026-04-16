import type { Character, CharacterSub } from '../../../entities/character';
import type { MemberEntry } from '../../../shared/lib';
import { TextField, TagField, PairListField } from '../../../shared/ui';

interface CharacterFormProps {
  value: Character;
  onPatch: (patch: Partial<Character>) => void;
}

export const CharacterForm = ({ value, onPatch }: CharacterFormProps) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <TextField
        label="분류"
        value={value.sub}
        onChange={(v) => onPatch({ sub: v as CharacterSub })}
        placeholder="주역, 조연, 반동, 기타"
      />
      <TextField
        label="출처 / 참고"
        value={value.source}
        onChange={(v) => onPatch({ source: v })}
        placeholder="소설·웹툰"
      />
    </div>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TagField label="별칭" value={value.aliases} onChange={(v) => onPatch({ aliases: v })} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '8px' }}>
      <TextField label="성별" value={value.sex} onChange={(v) => onPatch({ sex: v })} placeholder="남/여/기타" />
      <TextField label="나이" value={value.age} onChange={(v) => onPatch({ age: v })} placeholder="20대 / 미상" />
      <TextField
        label="출신"
        value={value.origin}
        onChange={(v) => onPatch({ origin: v })}
        placeholder="화산파 / 낭인 등"
      />
    </div>
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <TagField label="특징" value={value.traits} onChange={(v) => onPatch({ traits: v })} />
    <PairListField
      label="관계"
      keyLeft="n"
      keyRight="d"
      value={value.relations}
      onChange={(v) => onPatch({ relations: v as MemberEntry[] })}
      placeholderLeft="인물/관계"
      placeholderRight="설명"
    />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);
