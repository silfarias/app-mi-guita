import { SaldoPorMedioPago } from '@/features/reporte/interfaces/reporte.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface SaldosPorMedioPagoProps {
  saldos: SaldoPorMedioPago[];
  showDetails?: boolean; // Si muestra detalles (inicial, ingresos, egresos) o solo saldo actual
}

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
};

const getMedioPagoIcon = (tipo: string) => {
  return tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank';
};

export function SaldosPorMedioPago({ saldos, showDetails = false }: SaldosPorMedioPagoProps) {
  if (!saldos || saldos.length === 0) return null;

  return (
    <Card style={styles.saldosCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="credit-card-multiple" size={24} color="#6CB4EE" />
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Saldos por Medio de Pago
          </Text>
        </View>
        {saldos.map((saldo) => (
          <View key={saldo.medioPago.id} style={styles.saldoItem}>
            <View style={styles.saldoLeft}>
              <MaterialCommunityIcons
                name={getMedioPagoIcon(saldo.medioPago.tipo) as any}
                size={24}
                color="#6CB4EE"
              />
              <View style={styles.saldoInfo}>
                <Text variant="bodyMedium" style={styles.saldoNombre}>
                  {saldo.medioPago.nombre}
                </Text>
                {showDetails && (
                  <Text variant="bodySmall" style={styles.saldoMeta}>
                    Inicial: {formatCurrency(saldo.saldoInicial)} • Ingresos:{' '}
                    {formatCurrency(saldo.totalIngresos)} • Egresos: {formatCurrency(saldo.totalEgresos)}
                  </Text>
                )}
              </View>
            </View>
            <Text variant="bodyLarge" style={styles.saldoAmount}>
              {formatCurrency(saldo.saldoActual)}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  saldosCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  saldoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  saldoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  saldoInfo: {
    flex: 1,
  },
  saldoNombre: {
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  saldoMeta: {
    color: '#666666',
  },
  saldoAmount: {
    fontWeight: '600',
    color: '#6CB4EE',
  },
});
