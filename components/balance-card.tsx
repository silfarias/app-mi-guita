import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface BalanceCardProps {
  balanceTotal: number;
  balanceMes: number;
}

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
};

export function BalanceCard({ balanceTotal, balanceMes }: BalanceCardProps) {
  return (
    <Card style={styles.balanceCard}>
      <Card.Content>
        <View style={styles.balanceHeader}>
          <MaterialCommunityIcons name="wallet" size={28} color="#6CB4EE" />
          <Text variant="titleMedium" style={styles.balanceLabel}>
            Balance Total
          </Text>
        </View>
        <Text variant="headlineMedium" style={styles.balanceAmount}>
          {formatCurrency(balanceTotal)}
        </Text>
        <Text variant="bodySmall" style={styles.balanceSubtext}>
          Balance del mes: {formatCurrency(balanceMes)}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#6CB4EE',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  balanceLabel: {
    fontWeight: '600',
    color: '#333333',
  },
  balanceAmount: {
    fontWeight: 'bold',
    color: '#6CB4EE',
    marginBottom: 4,
  },
  balanceSubtext: {
    color: '#666666',
  },
});
