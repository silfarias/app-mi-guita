import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MedioPagoElemento } from '@/features/medio-pago/interfaces/medio-pago.interface';
import { formatCurrency } from '@/utils/currency';
import { getMedioPagoIcon } from '@/utils/medio-pago-icon';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface InfoInicialMedioPagoCardProps {
  medio: MedioPagoElemento;
  montoTotal: number;
  index?: number;
}

export function InfoInicialMedioPagoCard({ medio, montoTotal, index = 0 }: InfoInicialMedioPagoCardProps) {
  const montoNum = parseFloat(medio.monto);
  const porcentaje =
    montoTotal > 0 ? ((montoNum / montoTotal) * 100).toFixed(1) : '0';
  const tipoLabel = medio.medioPago.tipo === 'BILLETERA_VIRTUAL' ? 'Billetera Virtual' : 'Banco';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getMedioPagoIcon(medio.medioPago.tipo)}
            size={24}
            color="#6CB4EE"
          />
        </View>
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.name}>
            {medio.medioPago.nombre}
          </Text>
          <Text variant="bodySmall" style={styles.tipo}>
            {tipoLabel}
          </Text>
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text variant="headlineSmall" style={styles.amount}>
          {formatCurrency(medio.monto)}
        </Text>
        <View style={styles.porcentajeBadge}>
          <Text variant="bodySmall" style={styles.porcentajeText}>
            {porcentaje}%
          </Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${porcentaje}%` as `${number}%`,
              backgroundColor: '#6CB4EE',
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    color: '#333333',
  },
  tipo: {
    color: '#666666',
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontWeight: 'bold',
    color: '#333333',
  },
  porcentajeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  porcentajeText: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
