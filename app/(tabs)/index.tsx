import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { MovimientoModal } from '@/components/movimiento-modal';
import { useLogout } from '@/features/auth/hooks/auth.hook';
import { useDeleteMovimiento, useMovimientosPorInfo } from '@/features/movimiento/hooks/movimiento.hook';
import { TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { useAuthStore } from '@/store/auth.store';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Card, IconButton, Menu, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMovimientoModalVisible, setIsMovimientoModalVisible] = useState(false);
  const [isConfirmacionModalVisible, setIsConfirmacionModalVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [movimientosExpandidos, setMovimientosExpandidos] = useState<Set<number>>(new Set());
  const translateX = useSharedValue(300);
  const opacity = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.usuario?.persona?.nombre || '');
  const { logout, loading: logoutLoading } = useLogout();
  const { data: movimientosData, loading: movimientosLoading, error: movimientosError, fetchMovimientos } = useMovimientosPorInfo();
  const { deleteMovimiento, loading: deleting } = useDeleteMovimiento();

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  // Cargar movimientos al montar el componente
  useEffect(() => {
    fetchMovimientos();
  }, []);

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);

    if (newState) {
      translateX.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0.5, { duration: 200 });
    } else {
      translateX.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  };

  const closeMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      translateX.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  };

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  // Obtener movimientos del mes actual
  const movimientosDelMes = movimientosData?.data?.[0]?.movimientos || [];
  const infoInicial = movimientosData?.data?.[0]?.infoInicial;

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const getMedioPagoIcon = (tipo: string) => {
    return tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank';
  };

  const handleEditarMovimiento = (movimientoId: number) => {
    setMovimientoSeleccionado(movimientoId);
    setMenuVisible(null);
    setIsMovimientoModalVisible(true);
  };

  const handleEliminarMovimiento = (movimientoId: number) => {
    setMovimientoSeleccionado(movimientoId);
    setMenuVisible(null);
    setIsConfirmacionModalVisible(true);
  };

  const confirmarEliminar = async () => {
    if (movimientoSeleccionado) {
      try {
        await deleteMovimiento(movimientoSeleccionado);
        Toast.show({
          type: 'success',
          text1: '¡Movimiento eliminado!',
          text2: 'El movimiento se ha eliminado exitosamente',
          position: 'top',
          visibilityTime: 3000,
        });
        setIsConfirmacionModalVisible(false);
        setMovimientoSeleccionado(null);
        fetchMovimientos();
      } catch (error) {
        // El error ya se maneja en el hook
      }
    }
  };

  const toggleMovimientoExpandido = (movimientoId: number) => {
    setMovimientosExpandidos((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(movimientoId)) {
        nuevo.delete(movimientoId);
      } else {
        nuevo.add(movimientoId);
      }
      return nuevo;
    });
  };

  return (
    <View style={styles.container}>
      {/* Header con botón hamburguesa */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineSmall" style={styles.title}>
              Hola, {user}
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              {currentMonth} {currentYear}
            </Text>
          </View>
          <IconButton
            icon="menu"
            size={28}
            onPress={toggleMenu}
            style={styles.headerMenuButton}
          />
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={movimientosLoading} onRefresh={fetchMovimientos} />
        }
      >
        {/* Resumen del mes */}
        {infoInicial && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryHeader}>
                <MaterialCommunityIcons name="calendar-month" size={24} color="#6CB4EE" />
                <Text variant="titleMedium" style={styles.summaryTitle}>
                  Resumen del Mes
                </Text>
              </View>
              <View style={styles.summaryAmount}>
                <Text variant="headlineMedium" style={styles.summaryAmountText}>
                  {formatCurrency(infoInicial.montoTotal.toString())}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.summarySubtext}>
                Total disponible
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Botón crear movimiento */}
        <Button
          mode="contained"
          onPress={() => setIsMovimientoModalVisible(true)}
          style={styles.createButton}
          contentStyle={styles.createButtonContent}
          labelStyle={styles.createButtonLabel}
          icon="plus-circle"
        >
          Crear Movimiento
        </Button>

        {/* Lista de movimientos */}
        {movimientosLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6CB4EE" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Cargando movimientos...
            </Text>
          </View>
        ) : movimientosError ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <View style={styles.errorContent}>
                <MaterialCommunityIcons name="alert-circle" size={48} color="#D32F2F" />
                <Text variant="bodyLarge" style={styles.errorText}>
                  {movimientosError}
                </Text>
                <Button
                  mode="outlined"
                  onPress={fetchMovimientos}
                  style={styles.retryButton}
                >
                  Reintentar
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : movimientosDelMes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <MaterialCommunityIcons name="wallet-outline" size={64} color="#999999" />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No hay movimientos
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Comienza registrando tu primer movimiento del mes
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.movimientosContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Movimientos ({movimientosDelMes.length})
            </Text>
            {movimientosDelMes.map((movimiento) => {
              const isExpanded = movimientosExpandidos.has(movimiento.id);
              return (
                <TouchableOpacity
                  key={movimiento.id}
                  activeOpacity={0.7}
                  onPress={() => toggleMovimientoExpandido(movimiento.id)}
                >
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
                              {formatCurrency(movimiento.monto)}
                            </Text>
                            <Menu
                              visible={menuVisible === movimiento.id}
                              onDismiss={() => setMenuVisible(null)}
                              anchor={
                                <TouchableOpacity
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setMenuVisible(movimiento.id);
                                  }}
                                  style={styles.menuButton}
                                >
                                  <MaterialCommunityIcons name="dots-vertical" size={24} color="#666666" />
                                </TouchableOpacity>
                              }
                              contentStyle={styles.menuDropdownContent}
                            >
                              <Menu.Item
                                onPress={() => {
                                  setMenuVisible(null);
                                  handleEditarMovimiento(movimiento.id);
                                }}
                                title="Editar"
                                leadingIcon="pencil"
                              />
                              <Menu.Item
                                onPress={() => {
                                  setMenuVisible(null);
                                  handleEliminarMovimiento(movimiento.id);
                                }}
                                title="Eliminar"
                                leadingIcon="delete"
                                titleStyle={styles.deleteMenuItem}
                              />
                            </Menu>
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
            })}
          </View>
        )}
      </ScrollView>

      {/* Backdrop oscuro */}
      {isMenuOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </TouchableWithoutFeedback>
      )}

      {/* Menú lateral */}
      {isMenuOpen && (
        <Animated.View style={[styles.menu, menuAnimatedStyle, { paddingTop: insets.top }]}>
          <View style={styles.menuHeader}>
            <Text variant="headlineSmall" style={styles.menuTitle}>
              Opciones
            </Text>
            <TouchableOpacity onPress={closeMenu} style={styles.closeButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="window-close" size={28} color="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push('/profile' as any);
              }}
            >
              <MaterialCommunityIcons name="account-circle" size={24} color="#333333" style={styles.menuIcon} />
              <Text variant="bodyLarge" style={styles.menuItemText}>Mi perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={closeMenu}>
              <MaterialCommunityIcons name="swap-horizontal" size={24} color="#333333" style={styles.menuIcon} />
              <Text variant="bodyLarge" style={styles.menuItemText}>Mis transacciones</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                logout();
              }}
              disabled={logoutLoading}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" style={styles.menuIcon} />
              <Text variant="bodyLarge" style={[styles.menuItemText, styles.logoutText]}>
                {logoutLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Modal de Crear/Editar Movimiento */}
      <MovimientoModal
        visible={isMovimientoModalVisible}
        onDismiss={() => {
          setIsMovimientoModalVisible(false);
          setMovimientoSeleccionado(null);
        }}
        movimientoId={movimientoSeleccionado}
        onSuccess={() => {
          fetchMovimientos();
          setMovimientoSeleccionado(null);
        }}
      />

      {/* Modal de Confirmación para Eliminar */}
      <ConfirmacionModal
        visible={isConfirmacionModalVisible}
        onDismiss={() => {
          setIsConfirmacionModalVisible(false);
          setMovimientoSeleccionado(null);
        }}
        onConfirm={confirmarEliminar}
        title="¿Eliminar movimiento?"
        message="¿Seguro que quieres eliminar este movimiento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    color: '#666666',
    marginTop: 2,
  },
  headerMenuButton: {
    margin: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#333333',
  },
  summaryAmount: {
    marginTop: 8,
  },
  summaryAmountText: {
    fontWeight: 'bold',
    color: '#6CB4EE',
  },
  summarySubtext: {
    color: '#666666',
    marginTop: 4,
  },
  createButton: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#6CB4EE',
    shadowColor: '#6CB4EE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonContent: {
    paddingVertical: 8,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  emptyCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: '600',
    color: '#333333',
  },
  emptyText: {
    marginTop: 8,
    color: '#666666',
    textAlign: 'center',
  },
  movimientosContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#333333',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  menuButton: {
    padding: 2,
  },
  menuDropdownContent: {
    backgroundColor: '#FFFFFF',
  },
  deleteMenuItem: {
    color: '#E74C3C',
  },
  movimientoMonto: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  movimientoMontoEgreso: {
    color: '#E74C3C',
  },
  movimientoMontoIngreso: {
    color: '#27AE60',
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuTitle: {
    fontWeight: 'bold',
    color: '#333333',
  },
  menuContent: {
    flex: 1,
    paddingTop: 16,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    backgroundColor: 'transparent',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    color: '#333333',
    flex: 1,
  },
  logoutText: {
    color: '#D32F2F',
  },
});
