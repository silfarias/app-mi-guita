import { CategoriaIconBadge, CardActionsMenu } from '@/common/components';
import { PagoGastoFijoPorGastoFijoResponse } from '@/features/gasto-fijo/interfaces/pago-gasto-fijo.interface';
import { formatCurrency } from '@/utils/currency';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Checkbox, Text } from 'react-native-paper';

export interface GastoFijoPagoCardProps {
  item: PagoGastoFijoPorGastoFijoResponse;
  onEdit?: (gastoFijoId: number) => void;
  onDelete?: (gastoFijoId: number) => void;
  onTogglePagado?: (item: PagoGastoFijoPorGastoFijoResponse, pagado: boolean) => void;
  menuVisible?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  showMenu?: boolean;
  /** Si true, el checkbox está deshabilitado (actualización en curso) */
  pagadoDisabled?: boolean;
}

export function GastoFijoPagoCard({
  item,
  onEdit,
  onDelete,
  onTogglePagado,
  menuVisible = false,
  onMenuOpen,
  onMenuClose,
  showMenu = true,
  pagadoDisabled = false,
}: GastoFijoPagoCardProps) {
  const { gastoFijo, pago } = item;
  const montoFijoVal = gastoFijo.montoFijo;
  const monto =
    montoFijoVal === null || montoFijoVal === undefined || montoFijoVal === ''
      ? pago.montoPago
      : typeof montoFijoVal === 'string'
        ? parseFloat(montoFijoVal) || pago.montoPago
        : montoFijoVal;
  const tienePagoId = pago.id != null;

  const menuActions = [
    ...(onEdit
      ? [
          {
            key: 'edit',
            title: 'Editar',
            leadingIcon: 'pencil',
            onPress: () => onEdit(gastoFijo.id),
            destructive: false as const,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            key: 'delete',
            title: 'Eliminar',
            leadingIcon: 'delete',
            onPress: () => onDelete(gastoFijo.id),
            destructive: true as const,
          },
        ]
      : []),
  ];

  const handleTogglePagado = () => {
    if (onTogglePagado && !pagadoDisabled && tienePagoId) {
      onTogglePagado(item, !pago.pagado);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.left}>
            <CategoriaIconBadge
              icono={gastoFijo.categoria.icono}
              color={gastoFijo.categoria.color}
              size={48}
            />
            <View style={styles.info}>
              <View style={styles.nombreRow}>
                <Text variant="titleMedium" style={styles.nombre}>
                  {gastoFijo.nombre}
                </Text>
                {gastoFijo.activo === false && (
                  <View style={styles.inactivoBadge}>
                    <Text variant="labelSmall" style={styles.inactivoText}>
                      Inactivo
                    </Text>
                  </View>
                )}
              </View>
              <Text variant="bodySmall" style={styles.categoria}>
                {gastoFijo.categoria.nombre}
              </Text>
            </View>
          </View>
          <View style={styles.right}>
            <View style={styles.rightTop}>
              <Text variant="titleMedium" style={styles.monto}>
                {formatCurrency(monto)}
              </Text>
              {showMenu && menuActions.length > 0 && (
                <CardActionsMenu
                  visible={menuVisible}
                  onDismiss={onMenuClose ?? (() => {})}
                  onOpen={onMenuOpen ?? (() => {})}
                  actions={menuActions}
                />
              )}
            </View>
            <Text variant="bodySmall" style={styles.montoLabel}>
              por mes
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleTogglePagado}
          disabled={pagadoDisabled || !tienePagoId}
          style={styles.pagadoRow}
          activeOpacity={0.7}
        >
          <Text variant="bodySmall" style={styles.pagadoLabel}>
            Pagado
          </Text>
          <Checkbox
            status={pago.pagado ? 'checked' : 'unchecked'}
            onPress={handleTogglePagado}
            disabled={pagadoDisabled || !tienePagoId}
            color="#6CB4EE"
          />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
  },
  header: {
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
  nombreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nombre: {
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  inactivoBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inactivoText: {
    color: '#E65100',
    fontWeight: '600',
  },
  categoria: {
    color: '#666666',
  },
  right: {
    alignItems: 'flex-end',
  },
  rightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  monto: {
    fontWeight: 'bold',
    color: '#333333',
  },
  montoLabel: {
    color: '#999999',
    marginTop: 2,
  },
  pagadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  pagadoLabel: {
    color: '#666666',
  },
});
