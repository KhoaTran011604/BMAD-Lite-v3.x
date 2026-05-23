import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormError } from './FormError';

interface FormFieldItemProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  name: string;
  error?: string;
  register: UseFormRegisterReturn;
  as?: 'input' | 'select';
  children?: React.ReactNode;
}

export function FormFieldItem({
  label,
  name,
  error,
  register,
  as = 'input',
  children,
  type = 'text',
  className = '',
  style,
  ...props
}: FormFieldItemProps) {
  const isError = Boolean(error);

  return (
    <div
      className="form-group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        ...style,
      }}
    >
      <label
        htmlFor={props.id || name}
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--muted-foreground)',
        }}
      >
        {label}{' '}
        {props.required && (
          <span className="required-indicator" style={{ color: 'var(--danger)' }}>
            *
          </span>
        )}
      </label>

      {as === 'select' ? (
        <select
          id={props.id || name}
          className={`glass-input ${className} ${isError ? 'error' : ''}`}
          {...register}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {children}
        </select>
      ) : (
        <input
          id={props.id || name}
          type={type}
          className={`glass-input ${className} ${isError ? 'error' : ''}`}
          {...register}
          {...props}
        />
      )}

      <FormError message={error} />
    </div>
  );
}
