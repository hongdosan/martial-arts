import { fieldInputStyle, fieldLabelStyle, fieldWrapperStyle } from './styles';

interface TextFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export const TextField = ({ label, value, onChange, placeholder, multiline }: TextFieldProps) => (
  <div style={fieldWrapperStyle}>
    <label style={fieldLabelStyle}>{label}</label>
    {multiline ? (
      <textarea
        rows={3}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...fieldInputStyle, resize: 'vertical' }}
      />
    ) : (
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={fieldInputStyle}
      />
    )}
  </div>
);
