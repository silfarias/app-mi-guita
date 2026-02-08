import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/currency';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface InfoInicialTotalCardProps {
  montoTotal: number | string;
}

export function InfoInicialTotalCard({ montoTotal }: InfoInicialTotalCardProps) {
  const amount = typeof montoTotal === 'string' ? parseFloat(montoTotal) : montoTotal;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="cash-multiple" size={28} color="#FFFFFF" />
        <Text variant="titleMedium" style={styles.label}>
          Monto Total Inicial
        </Text>
      </View>
      <Text variant="displaySmall" style={styles.amount}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#6CB4EE',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#6CB4EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amount: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
