import React from 'react';

interface VoiceInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  id?: string;
  label?: string;
}

/**
 * Standard text input/textarea component.
 */
export const VoiceInputField: React.FC<VoiceInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  multiline = false,
  rows = 3,
  id = 'input-field',
  label
}) => {
  return (
    <div className={`form-field-group ${className}`}>
      {label && (
        <label htmlFor={id} className="gov-input-label">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="gov-textarea"
        />
      ) : (
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="gov-input"
        />
      )}
    </div>
  );
};
