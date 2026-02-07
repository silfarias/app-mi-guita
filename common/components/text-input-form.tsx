import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

export interface TextInputFormProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  onBlur?: () => void;
  style?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<TextStyle>;
  outlineStyle?: object;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const defaultOutlineStyle = { borderRadius: 12, borderWidth: 1.5 };
const fieldErrorStyle = { color: '#C62828', marginTop: 6, marginBottom: 4, marginLeft: 4 };

export function TextInputForm(p: TextInputFormProps) {
  const a = p;
  return (
    <View style={{ marginBottom: a.error ? 4 : 0 }}>
      <TextInput
        label={a.label || ''}
        placeholder={a.placeholder || ''}
        value={a.value}
        onChangeText={a.onChangeText}
        onBlur={a.onBlur}
        mode="outlined"
        multiline={a.multiline || false}
        numberOfLines={a.multiline ? (a.numberOfLines || 3) : undefined}
        maxLength={a.maxLength}
        disabled={a.disabled || false}
        error={!!a.error}
        style={[{ backgroundColor: '#FFFFFF', marginTop: 15 }, a.style]}
        contentStyle={a.contentStyle}
        outlineStyle={a.outlineStyle || defaultOutlineStyle}
        left={a.left}
        right={a.right}
      />
      {a.error ? <Text variant="bodySmall" style={fieldErrorStyle}>{a.error}</Text> : null}
    </View>
  );
}
