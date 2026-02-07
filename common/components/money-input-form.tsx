import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

export interface MoneyInputFormProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  keyboardType?: 'numeric' | 'decimal-pad';
  showCurrencyIcon?: boolean;
  min?: number;
  max?: number;
  decimalPlaces?: number;
  onBlur?: () => void;
  style?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<TextStyle>;
  outlineStyle?: object;
}

const defaultOutlineStyle = {
  borderRadius: 12,
  borderWidth: 1.5,
};

const fieldErrorStyle = {
  color: '#C62828' as const,
  marginTop: 6,
  marginBottom: 4,
  marginLeft: 4,
};

export function MoneyInputForm({
  value,
  onChange,
  label = 'Monto',
  placeholder = '0.00',
  error,
  disabled = false,
  keyboardType = 'decimal-pad',
  showCurrencyIcon = true,
  min,
  max,
  decimalPlaces,
  onBlur,
  style,
  contentStyle,
  outlineStyle = defaultOutlineStyle,
}: MoneyInputFormProps) {
  const displayValue = value === 0 ? '' : value.toString();

  const handleChangeText = (text: string) => {
    const trimmed = text.trim().replace(',', '.');
    if (trimmed === '' || trimmed === '-') {
      onChange(0);
      return;
    }
    const num = parseFloat(trimmed);
    onChange(Number.isNaN(num) ? 0 : num);
  };

  const handleBlur = () => {
    if (decimalPlaces != null && value !== 0 && !Number.isNaN(value)) {
      const rounded = Number(Number(value).toFixed(decimalPlaces));
      if (rounded !== value) {
        onChange(rounded);
      }
    }
    onBlur?.();
  };

  return (
    <View style={{ marginBottom: error ? 4 : 0 }}>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={displayValue}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        mode="outlined"
        keyboardType={keyboardType}
        disabled={disabled}
        error={!!error}
        style={[{ backgroundColor: '#FFFFFF', marginTop: 15 }, style]}
        contentStyle={contentStyle}
        outlineStyle={outlineStyle}
        left={
          showCurrencyIcon ? (
            <TextInput.Icon icon="currency-usd" />
          ) : undefined
        }
      />
      {error ? (
        <Text variant="bodySmall" style={fieldErrorStyle}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
