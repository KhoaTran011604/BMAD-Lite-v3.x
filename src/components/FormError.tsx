import React from 'react';

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <span
      className="form-field-error"
      role="alert"
      style={{
        display: 'block',
        marginTop: '0.25rem',
        color: '#ef4444',
        fontSize: '0.8rem',
      }}
    >
      {message}
    </span>
  );
}
