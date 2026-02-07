import { StyleSheet, Text } from 'react-native';
import { formatCurrency } from '@/utils/currency';

export type AmountType = 'INGRESO' | 'EGRESO';

export interface AmountDisplayProps {
  amount: number | string;
  type: AmountType;
  variant?: 'titleMedium' | 'bodyLarge' | 'bodyMedium';
  /** Si true, no muestra el signo + para ingresos. */
  hideSign?: boolean;
}

const INGRESO_COLOR = '#27AE60';
const EGRESO_COLOR = '#E74C3C';

export function AmountDisplay({
  amount,
  type,
  variant = 'titleMedium',
  hideSign = false,
}: AmountDisplayProps) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = formatCurrency(value);
  const sign = type === 'EGRESO' ? '-' : hideSign ? '' : '+';
  const color = type === 'EGRESO' ? EGRESO_COLOR : INGRESO_COLOR;

  return (
    <Text style={[styles.amount, { color }]}>
      {sign}
      {formatted}
    </Text>
  );

}

const styles = StyleSheet.create({
  amount: {
    fontWeight: 'bold',
  },
});
