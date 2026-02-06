import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { GraficoTortaCategorias } from '@/components/grafico-torta-categorias';
import { InfoInicialModal } from '@/components/info-inicial-modal';
import { MovimientoModal } from '@/components/movimiento-modal';
import { useLogout } from '@/features/auth/hooks/auth.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useDeleteMovimiento, useMovimientosPorInfo } from '@/features/movimiento/hooks/movimiento.hook';
import { TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { useReporteMensual } from '@/features/reporte/hooks/reporte.hook';
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
  const [isInfoInicialModalVisible, setIsInfoInicialModalVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [movimientosExpandidos, setMovimientosExpandidos] = useState<Set<number>>(new Set());
  const translateX = useSharedValue(300);
  const opacity = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.usuario?.persona?.nombre || 'Usuario');
  const { logout, loading: logoutLoading } = useLogout();
  const { data: movimientosData, loading: movimientosLoading, error: movimientosError, fetchMovimientos } = useMovimientosPorInfo();
  const { data: reporteData, loading: reporteLoading, error: reporteError, fetchReporteMensual } = useReporteMensual();
  const { deleteMovimiento, loading: deleting } = useDeleteMovimiento();
  const { data: infoIniciales, loading: loadingInfoInicial, fetch: fetchInfoIniciales } = useInfoInicialPorUsuario();

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMovimientos();
    fetchReporteMensual({ anio: currentYear, mes: currentMonth });
    fetchInfoIniciales();
  }, []);

  // Verificar si hay info inicial para el mes actual
  const infoInicialDelMes = infoIniciales?.find(
    (info) => info.mes === currentMonth && info.anio === currentYear
  );
  const tieneInfoInicial = !!infoInicialDelMes;

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

  // Obtener movimientos del mes actual (últimos 5)
  const movimientosDelMes = movimientosData?.data?.[0]?.movimientos || [];
  const ultimosMovimientos = movimientosDelMes.slice(0, 5);

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

  const getMedioPagoIcon = (tipo: string) => {
    return tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank';
  };

  const formatVariacion = (variacion: number) => {
    const signo = variacion >= 0 ? '+' : '';
    return `${signo}${variacion.toFixed(1)}%`;
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
        fetchReporteMensual({ anio: currentYear, mes: currentMonth });
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

  const handleRefresh = () => {
    fetchMovimientos();
    fetchReporteMensual({ anio: currentYear, mes: currentMonth });
  };

  const isLoading = movimientosLoading || reporteLoading;

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
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Dashboard - Resumen Principal */}
        {tieneInfoInicial && reporteData && (
          <>
            {/* Cards de Resumen */}
            <View style={styles.resumenContainer}>
              <Card style={[styles.resumenCard, styles.ingresosCard]}>
                <Card.Content>
                  <View style={styles.resumenCardHeader}>
                    <MaterialCommunityIcons name="arrow-down-circle" size={24} color="#27AE60" />
                    <Text variant="bodySmall" style={styles.resumenCardLabel}>
                      Ingresos
                    </Text>
                  </View>
                  <Text
                    variant="headlineSmall"
                    style={styles.resumenCardAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {formatCurrency(reporteData.totalIngresos)}
                  </Text>
                </Card.Content>
              </Card>

              <Card style={[styles.resumenCard, styles.egresosCard]}>
                <Card.Content>
                  <View style={styles.resumenCardHeader}>
                    <MaterialCommunityIcons name="arrow-up-circle" size={24} color="#E74C3C" />
                    <Text variant="bodySmall" style={styles.resumenCardLabel}>
                      Egresos
                    </Text>
                  </View>
                  <Text
                    variant="headlineSmall"
                    style={styles.resumenCardAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {formatCurrency(reporteData.totalEgresos)}
                  </Text>
                </Card.Content>
              </Card>
            </View>

            {/* Balance Total */}
            <Card style={styles.balanceCard}>
              <Card.Content>
                <View style={styles.balanceHeader}>
                  <MaterialCommunityIcons name="wallet" size={28} color="#6CB4EE" />
                  <Text variant="titleMedium" style={styles.balanceLabel}>
                    Balance Total
                  </Text>
                </View>
                <Text variant="headlineMedium" style={styles.balanceAmount}>
                  {formatCurrency(reporteData.balanceTotal)}
                </Text>
                <Text variant="bodySmall" style={styles.balanceSubtext}>
                  Balance del mes: {formatCurrency(reporteData.balance)}
                </Text>
              </Card.Content>
            </Card>

            {/* Comparación con Mes Anterior */}
            {reporteData.comparacionMesAnterior && (
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
                          reporteData.comparacionMesAnterior.variacionIngresos >= 0
                            ? styles.comparacionPositiva
                            : styles.comparacionNegativa,
                        ]}
                      >
                        {formatVariacion(reporteData.comparacionMesAnterior.variacionIngresos)}
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
                          reporteData.comparacionMesAnterior.variacionEgresos >= 0
                            ? styles.comparacionPositiva
                            : styles.comparacionNegativa,
                        ]}
                      >
                        {formatVariacion(reporteData.comparacionMesAnterior.variacionEgresos)}
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
                          reporteData.comparacionMesAnterior.variacionBalance >= 0
                            ? styles.comparacionPositiva
                            : styles.comparacionNegativa,
                        ]}
                      >
                        {formatVariacion(reporteData.comparacionMesAnterior.variacionBalance)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {reporteData.resumenPorCategoria && reporteData.resumenPorCategoria.length > 0 && (
              <GraficoTortaCategorias data={reporteData.resumenPorCategoria} />
            )}

            {reporteData.top5Categorias && reporteData.top5Categorias.length > 0 && (
              <Card style={styles.categoriasCard}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="tag-multiple" size={24} color="#6CB4EE" />
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Top 5 Categorías
                    </Text>
                  </View>
                  {reporteData.top5Categorias.map((item, index) => (
                    <View key={item.categoria.id} style={styles.categoriaItem}>
                      <View style={styles.categoriaLeft}>
                        <View
                          style={[
                            styles.categoriaIconContainer,
                            { backgroundColor: `${item.categoria.color}20` },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={item.categoria.icono as any}
                            size={20}
                            color={item.categoria.color}
                          />
                        </View>
                        <View style={styles.categoriaInfo}>
                          <Text variant="bodyMedium" style={styles.categoriaNombre}>
                            {item.categoria.nombre}
                          </Text>
                          <Text variant="bodySmall" style={styles.categoriaMeta}>
                            {item.cantidadMovimientos} movimientos • {item.porcentaje.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                      <Text variant="bodyLarge" style={styles.categoriaMonto}>
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Saldos por Medio de Pago */}
            {reporteData.saldosPorMedioPago && reporteData.saldosPorMedioPago.length > 0 && (
              <Card style={styles.mediosPagoCard}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="credit-card-multiple" size={24} color="#6CB4EE" />
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Saldos por Medio de Pago
                    </Text>
                  </View>
                  {reporteData.saldosPorMedioPago.map((saldo) => (
                    <View key={saldo.medioPago.id} style={styles.medioPagoItem}>
                      <View style={styles.medioPagoLeft}>
                        <MaterialCommunityIcons
                          name={getMedioPagoIcon(saldo.medioPago.tipo) as any}
                          size={24}
                          color="#6CB4EE"
                        />
                        <View style={styles.medioPagoInfo}>
                          <Text variant="bodyMedium" style={styles.medioPagoNombre}>
                            {saldo.medioPago.nombre}
                          </Text>
                          <Text variant="bodySmall" style={styles.medioPagoMeta}>
                            Inicial: {formatCurrency(saldo.saldoInicial)} • Ingresos: {formatCurrency(saldo.totalIngresos)} • Egresos: {formatCurrency(saldo.totalEgresos)}
                          </Text>
                        </View>
                      </View>
                      <Text variant="bodyLarge" style={styles.medioPagoSaldo}>
                        {formatCurrency(saldo.saldoActual)}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {/* Botón crear movimiento o crear info inicial */}
        {!tieneInfoInicial ? (
          <Card style={styles.infoInicialCard}>
            <Card.Content>
              <View style={styles.infoInicialContent}>
                <MaterialCommunityIcons name="wallet-outline" size={48} color="#6CB4EE" />
                <Text variant="titleMedium" style={styles.infoInicialTitle}>
                  Configura tu mes
                </Text>
                <Text variant="bodyMedium" style={styles.infoInicialText}>
                  Para comenzar a registrar movimientos, primero debes configurar la información inicial del mes
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setIsInfoInicialModalVisible(true)}
                  style={styles.infoInicialButton}
                  contentStyle={styles.infoInicialButtonContent}
                  labelStyle={styles.infoInicialButtonLabel}
                  icon="wallet"
                  buttonColor="#6CB4EE"
                >
                  Configurar Información Inicial
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
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
        )}

        {/* Últimos Movimientos (máximo 5) - Solo si hay info inicial */}
        {tieneInfoInicial && (
          <>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6CB4EE" />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Cargando información...
                </Text>
              </View>
            ) : movimientosError || reporteError ? (
              <Card style={styles.errorCard}>
            <Card.Content>
              <View style={styles.errorContent}>
                <MaterialCommunityIcons name="alert-circle" size={48} color="#D32F2F" />
                <Text variant="bodyLarge" style={styles.errorText}>
                  {movimientosError || reporteError}
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleRefresh}
                  style={styles.retryButton}
                >
                  Reintentar
                </Button>
              </View>
            </Card.Content>
              </Card>
            ) : ultimosMovimientos.length === 0 ? (
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
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#6CB4EE" />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Últimos Movimientos
              </Text>
              {movimientosDelMes.length > 5 && (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/explore' as any)}
                  style={styles.verTodosButton}
                >
                  <Text variant="bodySmall" style={styles.verTodosText}>
                    Ver todos ({movimientosDelMes.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {ultimosMovimientos.map((movimiento) => {
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
                              styles.movimientoIconContainer,
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
                              numberOfLines={isExpanded ? undefined : 1}
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
                                <MaterialCommunityIcons name="dots-vertical" size={20} color="#666666" />
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
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
          </>
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
          fetchReporteMensual({ anio: currentYear, mes: currentMonth });
          setMovimientoSeleccionado(null);
        }}
      />

      {/* Modal de Crear Información Inicial */}
      <InfoInicialModal
        visible={isInfoInicialModalVisible}
        onDismiss={() => setIsInfoInicialModalVisible(false)}
        onSuccess={() => {
          fetchInfoIniciales();
          fetchMovimientos();
          fetchReporteMensual({ anio: currentYear, mes: currentMonth });
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
  resumenContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resumenCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  ingresosCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  egresosCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  resumenCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  resumenCardLabel: {
    color: '#666666',
    fontWeight: '500',
  },
  resumenCardAmount: {
    fontWeight: 'bold',
    color: '#333333',
  },
  balanceCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#6CB4EE',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  balanceLabel: {
    fontWeight: '600',
    color: '#333333',
  },
  balanceAmount: {
    fontWeight: 'bold',
    color: '#6CB4EE',
    marginBottom: 4,
  },
  balanceSubtext: {
    color: '#666666',
  },
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
    paddingVertical: 4,
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
  categoriasCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  mediosPagoCard: {
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
    flex: 1,
  },
  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoriaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoriaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriaInfo: {
    flex: 1,
  },
  categoriaNombre: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  categoriaMeta: {
    color: '#666666',
  },
  categoriaMonto: {
    fontWeight: 'bold',
    color: '#333333',
  },
  medioPagoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  medioPagoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  medioPagoInfo: {
    flex: 1,
  },
  medioPagoNombre: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  medioPagoMeta: {
    color: '#666666',
    fontSize: 11,
  },
  medioPagoSaldo: {
    fontWeight: 'bold',
    color: '#6CB4EE',
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
  verTodosButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  verTodosText: {
    color: '#6CB4EE',
    fontWeight: '600',
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
  movimientoIconContainer: {
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
    gap: 4,
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
  },
  movimientoMontoEgreso: {
    color: '#E74C3C',
  },
  movimientoMontoIngreso: {
    color: '#27AE60',
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
  infoInicialCard: {
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    elevation: 2,
  },
  infoInicialContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoInicialTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  infoInicialText: {
    marginBottom: 24,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoInicialButton: {
    borderRadius: 12,
  },
  infoInicialButtonContent: {
    paddingVertical: 8,
  },
  infoInicialButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
