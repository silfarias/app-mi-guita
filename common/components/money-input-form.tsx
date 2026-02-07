import React, { useState } from 'react';
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

/**
 * Formatea un número como moneda en formato argentino: X.XXX,XX
 * Punto como separador de miles, coma como decimal, 2 decimales.
 */
function formatMoneyDisplay(value: number): string {
  if (value === 0) return '';
  const fixed = Math.abs(value).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const result = `${formattedInt},${decPart}`;
  return value < 0 ? `-${result}` : result;
}

/**
 * Parsea un string formateado (1.250,50) o parcial (1,5) a número.
 * Elimina puntos (miles), trata coma como decimal.
 */
function parseMoneyInput(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '' || trimmed === ',' || trimmed === '-') return 0;
  const normalized = trimmed.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? 0 : num;
}

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
  const displayValue = formatMoneyDisplay(value);
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(undefined);

  const handleChangeText = (text: string) => {
    const num = parseMoneyInput(text);
    let finalValue = num;
    if (min != null && num < min) finalValue = min;
    if (max != null && num > max) finalValue = max;
    onChange(finalValue);
    const newDisplay = formatMoneyDisplay(finalValue);
    const commaPos = newDisplay.indexOf(',');
    const cursorPos = commaPos >= 0 ? commaPos : newDisplay.length;
    setSelection({ start: cursorPos, end: cursorPos });
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
        placeholder="0,00"
        value={displayValue}
        onChangeText={handleChangeText}
        selection={selection}
        onSelectionChange={() => setSelection(undefined)}
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
