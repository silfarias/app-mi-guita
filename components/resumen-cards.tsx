import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface ResumenCardsProps {
  totalIngresos: number;
  totalEgresos: number;
}

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
};

export function ResumenCards({ totalIngresos, totalEgresos }: ResumenCardsProps) {
  return (
    <View style={styles.resumenContainer}>
      <Card style={[styles.resumenCard, styles.ingresosCard]}>
        <Card.Content>
          <View style={styles.resumenCardHeader}>
            <MaterialCommunityIcons name="arrow-down-circle" size={24} color="#27AE60" />
            <Text variant="bodySmall" style={styles.resumenCardLabel}>
              Ingresos
            </Text>
          </View>
          <Text
            variant="headlineSmall"
            style={styles.resumenCardAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {formatCurrency(totalIngresos)}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.resumenCard, styles.egresosCard]}>
        <Card.Content>
          <View style={styles.resumenCardHeader}>
            <MaterialCommunityIcons name="arrow-up-circle" size={24} color="#E74C3C" />
            <Text variant="bodySmall" style={styles.resumenCardLabel}>
              Egresos
            </Text>
          </View>
          <Text
            variant="headlineSmall"
            style={styles.resumenCardAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {formatCurrency(totalEgresos)}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  resumenContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resumenCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  ingresosCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  egresosCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  resumenCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  resumenCardLabel: {
    color: '#666666',
    fontWeight: '500',
  },
  resumenCardAmount: {
    fontWeight: 'bold',
    color: '#333333',
  },
});
