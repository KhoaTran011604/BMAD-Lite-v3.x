import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseFormReturn, DefaultValues, FieldValues } from 'react-hook-form';
import type { ZodType } from 'zod';

interface GenericFormProps<TFormValues extends FieldValues> {
  schema: ZodType<TFormValues>;
  defaultValues?: DefaultValues<TFormValues>;
  onSubmit: (values: TFormValues, form: UseFormReturn<TFormValues>) => void | Promise<void>;
  children: (form: UseFormReturn<TFormValues>) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GenericForm<TFormValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className = '',
  style,
}: GenericFormProps<TFormValues>) {
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(values, form))}
      className={className}
      style={style}
      noValidate
    >
      {children(form)}
    </form>
  );
}
