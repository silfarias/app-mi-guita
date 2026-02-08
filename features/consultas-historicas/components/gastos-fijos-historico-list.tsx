import { CategoriaIconBadge, EmptyStateCard } from '@/common/components';
import { PagoGastoFijoPorGastoFijoResponse } from '@/features/gasto-fijo/interfaces/pago-gasto-fijo.interface';
import { formatCurrency } from '@/utils/currency';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export interface GastosFijosHistoricoListProps {
  pagos: PagoGastoFijoPorGastoFijoResponse[];
  mesSeleccionado: string;
  anioSeleccionado: number;
}

function GastoFijoPagoRow({ item }: { item: PagoGastoFijoPorGastoFijoResponse }) {
  const { gastoFijo, pago } = item;
  const monto =
    gastoFijo.montoFijo === null || gastoFijo.montoFijo === undefined || gastoFijo.montoFijo === ''
      ? pago.montoPago
      : typeof gastoFijo.montoFijo === 'string'
        ? parseFloat(gastoFijo.montoFijo) || pago.montoPago
        : gastoFijo.montoFijo;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.left}>
            <CategoriaIconBadge
              icono={gastoFijo.categoria.icono}
              color={gastoFijo.categoria.color}
              size={40}
            />
            <View style={styles.info}>
              <Text variant="titleSmall" style={styles.nombre} numberOfLines={1}>
                {gastoFijo.nombre}
              </Text>
              <Text variant="bodySmall" style={styles.categoria}>
                {gastoFijo.categoria.nombre}
              </Text>
            </View>
          </View>
          <View style={styles.right}>
            <Text variant="titleSmall" style={styles.monto}>
              {formatCurrency(monto)}
            </Text>
            <View
              style={[
                styles.badge,
                pago.pagado ? styles.badgePagado : styles.badgePendiente,
              ]}
            >
              <Text
                variant="labelSmall"
                style={pago.pagado ? styles.badgeTextPagado : styles.badgeTextPendiente}
              >
                {pago.pagado ? 'Pagado' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export function GastosFijosHistoricoList({
  pagos,
  mesSeleccionado,
  anioSeleccionado,
}: GastosFijosHistoricoListProps) {
  if (!pagos || pagos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="repeat" size={24} color="#6CB4EE" />
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Gastos fijos del mes
          </Text>
        </View>
        <EmptyStateCard
          icon="repeat"
          iconColor="#CCCCCC"
          iconSize={40}
          title="Sin gastos fijos"
          description={`No hay gastos fijos registrados para ${mesSeleccionado} ${anioSeleccionado}`}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="repeat" size={24} color="#6CB4EE" />
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Gastos fijos del mes ({pagos.length})
        </Text>
      </View>
      {pagos.map((item) => (
        <GastoFijoPagoRow key={item.gastoFijo.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  card: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  categoria: {
    color: '#666666',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  monto: {
    fontWeight: 'bold',
    color: '#333333',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePagado: {
    backgroundColor: '#E8F5E9',
  },
  badgeTextPagado: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  badgePendiente: {
    backgroundColor: '#FFEBEE',
  },
  badgeTextPendiente: {
    color: '#C62828',
    fontWeight: '600',
  },
});
