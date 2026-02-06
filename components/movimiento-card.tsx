import { MovimientoListItem, MovimientoSearchResponse, TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Menu, Text } from 'react-native-paper';

type MovimientoData = MovimientoListItem | MovimientoSearchResponse;

interface MovimientoCardProps {
  movimiento: MovimientoData;
  isExpanded?: boolean;
  onPress?: () => void;
  onEdit?: (movimientoId: number) => void;
  onDelete?: (movimientoId: number) => void;
  menuVisible?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  showMenu?: boolean; // Si se muestra el menú de opciones (editar/eliminar)
}

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const diaSemana = diasSemana[date.getDay()];
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  return `${diaSemana} ${dia} ${mes}`;
};

const getMovimientoId = (movimiento: MovimientoData): number => {
  return 'id' in movimiento ? movimiento.id : (movimiento as any).id || 0;
};

const getMovimientoMonto = (movimiento: MovimientoData): number => {
  return typeof movimiento.monto === 'string' ? parseFloat(movimiento.monto) : movimiento.monto;
};

const getMedioPagoIcon = (tipo: string) => {
  return tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank';
};

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

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.movimientoCard}>
        <Card.Content>
          <View style={styles.movimientoHeader}>
            <View style={styles.movimientoLeft}>
              <View
                style={[
                  styles.categoriaIconContainer,
                  { backgroundColor: `${movimiento.categoria.color}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={movimiento.categoria.icono as any}
                  size={24}
                  color={movimiento.categoria.color}
                />
              </View>
              <View style={styles.movimientoInfo}>
                <Text
                  variant="bodyLarge"
                  style={styles.movimientoDescripcion}
                  numberOfLines={isExpanded ? undefined : 2}
                  ellipsizeMode="tail"
                >
                  {movimiento.descripcion}
                </Text>
                <View style={styles.movimientoMeta}>
                  <Text variant="bodySmall" style={styles.movimientoCategoria}>
                    {movimiento.categoria.nombre}
                  </Text>
                  <Text variant="bodySmall" style={styles.movimientoFecha}>
                    {formatDate(movimiento.fecha)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.movimientoRight}>
              <View style={styles.movimientoRightTop}>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.movimientoMonto,
                    movimiento.tipoMovimiento === TipoMovimientoEnum.EGRESO
                      ? styles.movimientoMontoEgreso
                      : styles.movimientoMontoIngreso,
                  ]}
                >
                  {movimiento.tipoMovimiento === TipoMovimientoEnum.EGRESO ? '-' : '+'}
                  {formatCurrency(monto)}
                </Text>
                {showMenu && (onEdit || onDelete) && (
                  <Menu
                    visible={menuVisible}
                    onDismiss={onMenuClose}
                    anchor={
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          onMenuOpen?.();
                        }}
                        style={styles.menuButton}
                      >
                        <MaterialCommunityIcons name="dots-vertical" size={24} color="#666666" />
                      </TouchableOpacity>
                    }
                    contentStyle={styles.menuDropdownContent}
                  >
                    {onEdit && (
                      <Menu.Item
                        onPress={() => {
                          onMenuClose?.();
                          onEdit(movimientoId);
                        }}
                        title="Editar"
                        leadingIcon="pencil"
                      />
                    )}
                    {onDelete && (
                      <Menu.Item
                        onPress={() => {
                          onMenuClose?.();
                          onDelete(movimientoId);
                        }}
                        title="Eliminar"
                        leadingIcon="delete"
                        titleStyle={styles.deleteMenuItem}
                      />
                    )}
                  </Menu>
                )}
              </View>
              <View style={styles.movimientoMedioPago}>
                <MaterialCommunityIcons
                  name={getMedioPagoIcon(movimiento.medioPago.tipo) as any}
                  size={16}
                  color="#666666"
                />
                <Text variant="bodySmall" style={styles.movimientoMedioPagoText}>
                  {movimiento.medioPago.nombre}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  movimientoCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
  },
  movimientoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movimientoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    minWidth: 48,
    minHeight: 48,
  },
  movimientoInfo: {
    flex: 1,
  },
  movimientoDescripcion: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  movimientoMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    marginTop: 4,
  },
  movimientoCategoria: {
    color: '#666666',
  },
  movimientoFecha: {
    color: '#999999',
  },
  movimientoRight: {
    alignItems: 'flex-end',
  },
  movimientoRightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  movimientoMonto: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  movimientoMontoIngreso: {
    color: '#27AE60',
  },
  movimientoMontoEgreso: {
    color: '#E74C3C',
  },
  movimientoMedioPago: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  movimientoMedioPagoText: {
    color: '#666666',
    fontSize: 12,
  },
  menuButton: {
    padding: 2,
  },
  menuDropdownContent: {
    backgroundColor: '#FFFFFF',
  },
  deleteMenuItem: {
    color: '#E74C3C',
  },
});
