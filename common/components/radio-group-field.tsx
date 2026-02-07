import React from 'react';
import { View } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}

export interface RadioGroupFieldProps<T extends string = string> {
  title: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  color?: string;
  sectionStyle?: object;
  titleStyle?: object;
  rowStyle?: object;
  optionStyle?: object;
  labelStyle?: object;
}

const defaultTitleStyle = { fontWeight: '600' as const, color: '#333333', marginTop: 15 };
const defaultRowStyle = { flexDirection: 'row' as const, gap: 24, marginTop: 5 };
const defaultOptionStyle = { flexDirection: 'row' as const, alignItems: 'center' as const };
const defaultLabelStyle = { marginLeft: 8, color: '#333333' };

export function RadioGroupField<T extends string = string>({
  title,
  options,
  value,
  onChange,
  disabled = false,
  color = '#6CB4EE',
  sectionStyle,
  titleStyle = defaultTitleStyle,
  rowStyle = defaultRowStyle,
  optionStyle = defaultOptionStyle,
  labelStyle = defaultLabelStyle,
}: RadioGroupFieldProps<T>) {
  return (
    <View style={sectionStyle}>
      <Text variant="bodyLarge" style={titleStyle}>
        {title}
      </Text>
      <RadioButton.Group onValueChange={(v) => onChange(v as T)} value={value}>
        <View style={rowStyle}>
          {options.map((opt) => (
            <View key={opt.value} style={optionStyle}>
              <RadioButton value={opt.value} color={color} disabled={disabled} />
              <Text variant="bodyMedium" style={labelStyle}>
                {opt.label}
              </Text>
            </View>
          ))}
        </View>
      </RadioButton.Group>
    </View>
  );
}
