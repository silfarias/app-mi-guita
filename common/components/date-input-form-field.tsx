import React from 'react';
import { Controller, Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { DateInputForm } from './date-input-form';
import type { DateInputFormProps } from './date-input-form';
import { StyleProp, ViewStyle } from 'react-native';

export interface DateInputFormFieldProps<T extends FieldValues> extends Omit<DateInputFormProps, 'value' | 'onChange' | 'error'> {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors?: Partial<Record<Path<T>, { message?: string }>>;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * DateInputForm conectado a react-hook-form vía Controller.
 * El campo del form suele ser string (YYYY-MM-DD); el componente lo convierte a Date internamente.
 */
export function DateInputFormField<T extends FieldValues>({
  control,
  name,
  rules,
  ...rest
}: DateInputFormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <DateInputForm
          style={{ marginTop: 15 }}
          value={value}
          onChange={onChange}
          error={error?.message}
          {...rest}
        />
      )}
    />
  );
}
