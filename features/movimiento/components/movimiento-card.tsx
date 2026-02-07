import {
  AmountDisplay,
  CategoriaIconBadge,
  CardActionsMenu,
  MedioPagoLabel,
} from '@/common/components';
import {
  MovimientoListItem,
  MovimientoSearchResponse,
  TipoMovimientoEnum,
} from '@/features/movimiento/interfaces/movimiento.interface';
import { formatDateWithWeekday } from '@/utils/formatDate';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

type MovimientoData = MovimientoListItem | MovimientoSearchResponse;

export interface MovimientoCardProps {
  movimiento: MovimientoData;
  isExpanded?: boolean;
  onPress?: () => void;
  onEdit?: (movimientoId: number) => void;
  onDelete?: (movimientoId: number) => void;
  menuVisible?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  showMenu?: boolean;
}

function getMovimientoId(movimiento: MovimientoData): number {
  return 'id' in movimiento ? movimiento.id : (movimiento as MovimientoSearchResponse & { id?: number }).id ?? 0;
}

function getMovimientoMonto(movimiento: MovimientoData): number {
  return typeof movimiento.monto === 'string' ? parseFloat(movimiento.monto) : movimiento.monto;
}

export function MovimientoCard({
  movimiento,
  isExpanded = false,
  onPress,
  onEdit,
  onDelete,
  menuVisible = false,
  onMenuOpen,
  onMenuClose,
  showMenu = true,
}: MovimientoCardProps) {
  const movimientoId = getMovimientoId(movimiento);
  const monto = getMovimientoMonto(movimiento);

  const menuActions = [
    ...(onEdit
      ? [
          {
            key: 'edit',
            title: 'Editar',
            leadingIcon: 'pencil',
            onPress: () => onEdit(movimientoId),
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
            onPress: () => onDelete(movimientoId),
            destructive: true as const,
          },
        ]
      : []),
  ];

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.left}>
              <CategoriaIconBadge
                icono={movimiento.categoria.icono}
                color={movimiento.categoria.color}
                size={48}
              />
              <View style={styles.info}>
                <Text
                  variant="bodyLarge"
                  style={styles.descripcion}
                  numberOfLines={isExpanded ? undefined : 2}
                  ellipsizeMode="tail"
                >
                  {movimiento.descripcion}
                </Text>
                <View style={styles.meta}>
                  <Text variant="bodySmall" style={styles.categoria}>
                    {movimiento.categoria.nombre}
                  </Text>
                  <Text variant="bodySmall" style={styles.fecha}>
                    {formatDateWithWeekday(movimiento.fecha)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.right}>
              <View style={styles.rightTop}>
                <AmountDisplay
                  amount={monto}
                  type={movimiento.tipoMovimiento === TipoMovimientoEnum.EGRESO ? 'EGRESO' : 'INGRESO'}
                  variant="titleMedium"
                />
                {showMenu && menuActions.length > 0 && (
                  <CardActionsMenu
                    visible={menuVisible}
                    onDismiss={onMenuClose ?? (() => {})}
                    onOpen={onMenuOpen ?? (() => {})}
                    actions={menuActions}
                  />
                )}
              </View>
              <MedioPagoLabel tipo={movimiento.medioPago.tipo} nombre={movimiento.medioPago.nombre} />
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  descripcion: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    marginTop: 4,
  },
  categoria: {
    color: '#666666',
  },
  fecha: {
    color: '#999999',
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
});
