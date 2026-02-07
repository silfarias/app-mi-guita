import React from 'react';
import { Controller, Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { TextInputForm } from './text-input-form';
import type { TextInputFormProps } from './text-input-form';
import { StyleSheet, TextStyle } from 'react-native';

type ErrorsMap = Partial<Record<string, { message?: string }>>;

export interface TextInputFormFieldProps<T extends FieldValues> extends Omit<TextInputFormProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors?: ErrorsMap;
}

const contentStyleDefault = { textAlignVertical: 'center' as const };

export function TextInputFormField<T extends FieldValues>(p: TextInputFormFieldProps<T>) {
  const { control, name, rules, errors, ...rest } = p;
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextInputForm
          contentStyle={contentStyleDefault}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...rest}
        />
      )}
    />
  );
}