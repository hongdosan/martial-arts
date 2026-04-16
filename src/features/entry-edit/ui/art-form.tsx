import type { Art, ArtFaction, ArtType } from '../../../entities/art';
import type { DetailEntry } from '../../../shared/lib';
import { TextField, TagField, PairListField } from '../../../shared/ui';

interface ArtFormProps {
  value: Art;
  onPatch: (patch: Partial<Art>) => void;
}

export const ArtForm = ({ value, onPatch }: ArtFormProps) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <TextField
        label="세력"
        value={value.faction}
        onChange={(v) => onPatch({ faction: v as ArtFaction })}
        placeholder="정파, 사파, 마교, 혈교, 세외, 무소속"
      />
      <TextField
        label="계열"
        value={value.type}
        onChange={(v) => onPatch({ type: v as ArtType })}
        placeholder="심법, 병기법, 권각법, 신보법, 호신법, 암기법, 특수법"
      />
    </div>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField
      label="태그/계열"
      value={value.tag}
      onChange={(v) => onPatch({ tag: v })}
      placeholder="예: 정파, 소림사..."
    />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <TagField label="특징" value={value.traits} onChange={(v) => onPatch({ traits: v })} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <TextField
        label="장점"
        value={value.merits}
        onChange={(v) => onPatch({ merits: v })}
        multiline
      />
      <TextField
        label="단점"
        value={value.demerits}
        onChange={(v) => onPatch({ demerits: v })}
        multiline
      />
    </div>
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
