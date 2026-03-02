import { BalanceCard } from '@/components/balance-card';
import { ComparacionMesAnterior } from '@/components/comparacion-mes-anterior';
import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { GastosFijosResumenCard } from '@/components/gastos-fijos-resumen-card';
import { GraficoTortaCategorias } from '@/features/categoria/components/grafico-torta-categorias';
import { ResumenCards } from '@/components/resumen-cards';
import { SaldosPorMedioPago } from '@/features/medio-pago/components/saldos-por-medio-pago';
import { SideMenu, SideMenuItem } from '@/components/side-menu';
import { Top5Categorias } from '@/features/categoria/components/top5-categorias';
import { useLogout } from '@/features/auth/hooks/auth.hook';
import { GastoFijoModal } from '@/features/gasto-fijo/components/gasto-fijo-modal';
import { useMisGastosFijos } from '@/features/gasto-fijo/hooks/gasto-fijo.hook';
import { MovimientoCard } from '@/features/movimiento/components/movimiento-card';
import { MovimientoModal } from '@/features/movimiento/components/movimiento-modal';
import { useDeleteMovimiento, useMovimientosPorInfo } from '@/features/movimiento/hooks/movimiento.hook';
import { useDashboardResumen } from '@/features/dashboard/hooks/dashboard.hook';
import { useAuthStore } from '@/store/auth.store';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function HomeScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMovimientoModalVisible, setIsMovimientoModalVisible] = useState(false);
  const [isConfirmacionModalVisible, setIsConfirmacionModalVisible] = useState(false);
  const [isGastoFijoModalVisible, setIsGastoFijoModalVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [movimientosExpandidos, setMovimientosExpandidos] = useState<Set<number>>(new Set());
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.usuario?.persona?.nombre || 'Usuario');
  const usuarioFotoPerfil = useAuthStore((state) => state.usuario?.fotoPerfil);
  const { logout, loading: logoutLoading } = useLogout();
  const { data: movimientosData, loading: movimientosLoading, error: movimientosError, fetchMovimientos } = useMovimientosPorInfo();
  const { deleteMovimiento, loading: deleting } = useDeleteMovimiento();
  const { data: gastosFijosData, loading: loadingGastosFijos, fetchMisGastosFijos } = useMisGastosFijos();

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const { data: dashboard, loading: dashboardLoading, error: dashboardError, fetchDashboard } =
    useDashboardResumen(currentYear, currentMonth);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMovimientos();
    fetchDashboard();
    fetchMisGastosFijos();
  }, []);

  // Verificar si tiene gastos fijos
  const tieneGastosFijos = gastosFijosData?.gastosFijos && gastosFijosData.gastosFijos.length > 0;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems: SideMenuItem[] = [
    {
      icon: 'account-circle',
      label: 'Mi perfil',
      onPress: () => {
        closeMenu();
        router.push('/profile' as any);
      },
      avatarSource: usuarioFotoPerfil?.trim()
        ? { uri: usuarioFotoPerfil }
        : require('../../assets/images/icon.png'),
    },
    {
      icon: 'receipt-text',
      label: 'Informacion Inicial del Mes',
      onPress: () => {
        closeMenu();
        router.push('/info-inicial-mes' as any);
      },
      disabled: loadingGastosFijos,
      loading: loadingGastosFijos,
    },
    {
      icon: 'format-list-bulleted',
      label: 'Resumen Mensual',
      onPress: () => {
        closeMenu();
        router.push('/consultas-historicas' as any);
      },
    },
    {
      icon: 'logout',
      label: logoutLoading ? 'Cerrando sesión...' : 'Cerrar sesión',
      onPress: () => {
        closeMenu();
        logout();
      },
      disabled: logoutLoading,
      loading: logoutLoading,
      textColor: '#D32F2F',
      iconColor: '#D32F2F',
    },
    
  ];

  // Obtener movimientos del mes actual (últimos 5)
  const movimientosDelMes = movimientosData?.data?.[0]?.movimientos || [];
  const ultimosMovimientos = movimientosDelMes.slice(0, 5);


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

  const handleRefresh = () => {
    fetchMovimientos();
    fetchDashboard();
    fetchMisGastosFijos();
  };

  const isLoading = movimientosLoading || dashboardLoading;

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
        {/* Onboarding: usuario nuevo sin gastos fijos */}
        {!tieneGastosFijos ? (
          <Card style={styles.infoInicialCard}>
            <Card.Content>
              <View style={styles.infoInicialContent}>
                <MaterialCommunityIcons name="receipt-outline" size={48} color="#6CB4EE" />
                <Text variant="titleMedium" style={styles.infoInicialTitle}>
                  ¡Bienvenido a MiGuita!
                </Text>
                <Text variant="bodyMedium" style={styles.infoInicialText}>
                  Para comenzar, primero registra tus gastos fijos. Estos son pagos recurrentes que realizas cada mes (ej: alquiler, servicios, suscripciones).
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setIsGastoFijoModalVisible(true)}
                  style={styles.infoInicialButton}
                  contentStyle={styles.infoInicialButtonContent}
                  labelStyle={styles.infoInicialButtonLabel}
                  icon="receipt"
                  buttonColor="#6CB4EE"
                >
                  Registrar Gastos Fijos
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Dashboard - Resumen Principal (usa /dashboard) */}
            {dashboard && (
              <>
                {/* Cards de Resumen */}
                <ResumenCards
                  totalIngresos={dashboard.ingresosMes}
                  totalEgresos={dashboard.egresosMes}
                />

                {/* Balance Total */}
                <BalanceCard balanceTotal={dashboard.saldoTotal} balanceMes={dashboard.balanceMes} />

                {/* Gastos fijos resumen (a partir de presupuestos / alertas) */}
                {dashboard.presupuestos && dashboard.presupuestos.length > 0 && (
                  <GastosFijosResumenCard
                    pagados={dashboard.presupuestos.filter((p) => p.estado === 'OK').length}
                    total={dashboard.presupuestos.length}
                  />
                )}

                {/* Estado del mes con mensaje humano */}
                <ComparacionMesAnterior
                  comparacion={{
                    mensaje:
                      dashboard.balanceMes >= 0
                        ? 'Vas bien este mes 💪'
                        : 'Te estás pasando ⚠️',
                    balanceActual: dashboard.balanceMes,
                    ingresos: dashboard.ingresosMes,
                    egresos: dashboard.egresosMes,
                  } as any}
                />

                {/* Gráfico de Torta */}
                {dashboard.gastosPorCategoria && dashboard.gastosPorCategoria.length > 0 && (
                  <GraficoTortaCategorias
                    data={dashboard.gastosPorCategoria.map((item) => ({
                      categoria: {
                        id: 0,
                        nombre: item.categoria,
                        descripcion: '',
                        color: '#6CB4EE',
                        icono: 'cash',
                        activo: true,
                      },
                      total: item.total,
                      porcentaje: 0,
                      cantidadMovimientos: 0,
                    })) as any}
                  />
                )}

                {/* Top 5 Categorías */}
                {dashboard.topCategoriasGasto && dashboard.topCategoriasGasto.length > 0 && (
                  <Top5Categorias
                    categorias={dashboard.topCategoriasGasto.map((c) => ({
                      categoria: {
                        id: 0,
                        nombre: c.categoria,
                        descripcion: '',
                        color: '#6CB4EE',
                        icono: 'cash',
                        activo: true,
                      },
                      total: c.total,
                      porcentaje: 0,
                      cantidadMovimientos: 0,
                    })) as any}
                  />
                )}

                {/* Saldos por Medio de Pago */}
                {dashboard.gastosPorCuenta && dashboard.gastosPorCuenta.length > 0 && (
                  <SaldosPorMedioPago
                    saldos={dashboard.gastosPorCuenta.map((c) => ({
                      medioPago: c.cuenta,
                      total: c.total,
                    })) as any}
                    showDetails={true}
                  />
                )}
              </>
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
          </>
        )}



        {/* Últimos Movimientos (máximo 5) */}
        {true && (
          <>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6CB4EE" />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Cargando información...
                </Text>
              </View>
            ) : movimientosError || dashboardError ? (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <View style={styles.errorContent}>
                    <MaterialCommunityIcons name="alert-circle" size={48} color="#D32F2F" />
                    <Text variant="bodyLarge" style={styles.errorText}>
                      {movimientosError || dashboardError}
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
                    <MovimientoCard
                      key={movimiento.id}
                      movimiento={movimiento}
                      isExpanded={isExpanded}
                      onPress={() => toggleMovimientoExpandido(movimiento.id)}
                      onEdit={handleEditarMovimiento}
                      onDelete={handleEliminarMovimiento}
                      menuVisible={menuVisible === movimiento.id}
                      onMenuOpen={() => setMenuVisible(movimiento.id)}
                      onMenuClose={() => setMenuVisible(null)}
                      showMenu={true}
                    />
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Menú lateral */}
      <SideMenu visible={isMenuOpen} onClose={closeMenu} items={menuItems} />

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

      {/* Modal de Crear Gastos Fijos */}
      <GastoFijoModal
        visible={isGastoFijoModalVisible}
        onDismiss={() => setIsGastoFijoModalVisible(false)}
        onSuccess={() => {
          fetchMisGastosFijos();
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
