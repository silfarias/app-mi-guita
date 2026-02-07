import React from 'react';
import { Controller, Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { MoneyInputForm } from './money-input-form';
import type { MoneyInputFormProps } from './money-input-form';

export interface MoneyInputFormFieldProps<T extends FieldValues> extends Omit<MoneyInputFormProps, 'value' | 'onChange' | 'onBlur' | 'error'> {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors?: Partial<Record<Path<T>, { message?: string }>>;
}

/**
 * MoneyInputForm conectado a react-hook-form vía Controller.
 * Convierte value string/number del form a number para el input; onChange recibe number.
 */
export function MoneyInputFormField<T extends FieldValues>({
  control,
  name,
  rules,
  ...rest
}: MoneyInputFormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <MoneyInputForm
          value={typeof value === 'number' ? value : Number(value) || 0}
          onChange={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...rest}
        />
      )}
    />
  );
}
