import { TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface MovimientoListRowProps {
  descripcion: string;
  monto: number | string;
  tipoMovimiento: string;
  onPress?: () => void;
}

const formatMonto = (monto: number | string, tipo: string) => {
  const n = typeof monto === 'string' ? parseFloat(monto) : monto;
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.abs(n));
  if (tipo === TipoMovimientoEnum.EGRESO || tipo === 'EGRESO') {
    return `-${formatted}`;
  }
  return `+${formatted}`;
};

export function MovimientoListRow({
  descripcion,
  monto,
  tipoMovimiento,
  onPress,
}: MovimientoListRowProps) {
  const isEgreso = tipoMovimiento === TipoMovimientoEnum.EGRESO || tipoMovimiento === 'EGRESO';
  const montoStr = formatMonto(monto, tipoMovimiento);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text variant="bodyMedium" style={styles.descripcion} numberOfLines={1}>
        {descripcion}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.monto, isEgreso ? styles.montoEgreso : styles.montoIngreso]}
      >
        {montoStr}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
  },
  descripcion: {
    flex: 1,
    color: '#333333',
    fontWeight: '500',
  },
  monto: {
    fontWeight: '700',
    marginLeft: 12,
  },
  montoEgreso: {
    color: '#E74C3C',
  },
  montoIngreso: {
    color: '#27AE60',
  },
});
