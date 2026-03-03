import { ComparacionMesAnterior as ComparacionMesAnteriorType } from '@/features/reporte/interfaces/reporte.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface ComparacionMesAnteriorProps {
  comparacion: ComparacionMesAnteriorType;
}

export function ComparacionMesAnterior({ comparacion }: ComparacionMesAnteriorProps) {
  const variacionIngresos = Number(comparacion?.variacionIngresos) || 0;
  const variacionEgresos = Number(comparacion?.variacionEgresos) || 0;
  const variacionBalance = Number(comparacion?.variacionBalance) || 0;

  return (
    <Card style={styles.comparacionCard}>
      <Card.Content>
        <View style={styles.comparacionHeader}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#6CB4EE" />
          <Text variant="titleMedium" style={styles.comparacionTitle}>
            Comparación con mes anterior
          </Text>
        </View>
        <View style={styles.comparacionItems}>
          <View style={styles.comparacionItem}>
            <Text variant="bodySmall" style={styles.comparacionLabel}>
              Ingresos
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.comparacionValue,
                variacionIngresos >= 0 ? styles.comparacionPositiva : styles.comparacionNegativa,
              ]}
            >
              {variacionIngresos >= 0 ? '+' : ''}
              {variacionIngresos.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.comparacionItem}>
            <Text variant="bodySmall" style={styles.comparacionLabel}>
              Egresos
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.comparacionValue,
                variacionEgresos >= 0 ? styles.comparacionPositiva : styles.comparacionNegativa,
              ]}
            >
              {variacionEgresos >= 0 ? '+' : ''}
              {variacionEgresos.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.comparacionItem}>
            <Text variant="bodySmall" style={styles.comparacionLabel}>
              Balance
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.comparacionValue,
                variacionBalance >= 0 ? styles.comparacionPositiva : styles.comparacionNegativa,
              ]}
            >
              {variacionBalance >= 0 ? '+' : ''}
              {variacionBalance.toFixed(1)}%
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  comparacionCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  comparacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  comparacionTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  comparacionItems: {
    gap: 12,
  },
  comparacionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparacionLabel: {
    color: '#666666',
  },
  comparacionValue: {
    fontWeight: '600',
  },
  comparacionPositiva: {
    color: '#27AE60',
  },
  comparacionNegativa: {
    color: '#E74C3C',
  },
});
