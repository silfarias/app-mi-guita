import { CategoriaIconBadge, CardActionsMenu } from '@/common/components';
import { GastoFijoResponse } from '@/features/gasto-fijo/interfaces/gasto-fijo.interface';
import { formatCurrency } from '@/utils/currency';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export interface GastoFijoCardProps {
  gastoFijo: GastoFijoResponse;
  onEdit?: (gastoFijoId: number) => void;
  onDelete?: (gastoFijoId: number) => void;
  menuVisible?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  showMenu?: boolean;
}

export function GastoFijoCard({
  gastoFijo,
  onEdit,
  onDelete,
  menuVisible = false,
  onMenuOpen,
  onMenuClose,
  showMenu = true,
}: GastoFijoCardProps) {
  const monto =
    gastoFijo.montoFijo === null || gastoFijo.montoFijo === undefined || gastoFijo.montoFijo === ''
      ? 0
      : typeof gastoFijo.montoFijo === 'string'
        ? parseFloat(gastoFijo.montoFijo) || 0
        : gastoFijo.montoFijo;

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
              <Text variant="titleMedium" style={styles.nombre}>
                {gastoFijo.nombre}
              </Text>
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
  nombre: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
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
});
