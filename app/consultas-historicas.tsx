import { BalanceCard } from '@/components/balance-card';
import { ComparacionMesAnterior } from '@/components/comparacion-mes-anterior';
import { GraficoTortaCategorias } from '@/components/grafico-torta-categorias';
import { PaginationBar } from '@/components/pagination-bar';
import { ResumenCards } from '@/components/resumen-cards';
import { SaldosPorMedioPago } from '@/components/saldos-por-medio-pago';
import { Top5Categorias } from '@/components/top5-categorias';
import { Header } from '@/components/ui/header';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { MovimientoCard } from '@/features/movimiento/components/movimiento-card';
import { MovimientoModal } from '@/features/movimiento/components/movimiento-modal';
import { useMovimientosConFiltros } from '@/features/movimiento/hooks/movimiento.hook';
import { MovimientoFiltros } from '@/features/movimiento/interfaces/movimiento.interface';
import { useReporteMensual } from '@/features/reporte/hooks/reporte.hook';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Menu, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConsultasHistoricasScreen() {
  const insets = useSafeAreaInsets();
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(getCurrentMonth());
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(getCurrentYear());
  const [mesMenuVisible, setMesMenuVisible] = useState(false);
  const [isMovimientoModalVisible, setIsMovimientoModalVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [movimientosExpandidos, setMovimientosExpandidos] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0); // 0-indexed para el componente DataTable
  const [pageSize, setPageSize] = useState(10);

  const { data: infoIniciales, loading: loadingInfoInicial, fetch: fetchInfoIniciales } = useInfoInicialPorUsuario();
  const { data: reporteData, loading: reporteLoading, error: reporteError, fetchReporteMensual } = useReporteMensual();
  const { data: movimientosData, loading: movimientosLoading, error: movimientosError, aplicarFiltros, filtros } = useMovimientosConFiltros();

  const meses = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
  ];

  // Obtener info iniciales disponibles
  const infoInicialesDisponibles = infoIniciales || [];
  const infoInicialSeleccionado = infoInicialesDisponibles.find(
    (info) => info.mes === mesSeleccionado && info.anio === anioSeleccionado
  );

  // Calcular fechas de inicio y fin del mes seleccionado
  const getFechasDelMes = (mes: string, anio: number) => {
    const mesIndex = meses.indexOf(mes);
    const fechaInicio = new Date(anio, mesIndex, 1);
    const fechaFin = new Date(anio, mesIndex + 1, 0, 23, 59, 59);
    
    return {
      fechaDesde: fechaInicio.toISOString().split('T')[0],
      fechaHasta: fechaFin.toISOString().split('T')[0],
    };
  };

  // Cargar datos al montar y cuando cambia el mes/año seleccionado
  useEffect(() => {
    fetchInfoIniciales();
  }, []);

  useEffect(() => {
    if (mesSeleccionado && anioSeleccionado) {
      // Cargar reporte mensual
      fetchReporteMensual({ anio: anioSeleccionado, mes: mesSeleccionado });
      
      // Cargar movimientos del mes con paginación
      const { fechaDesde, fechaHasta } = getFechasDelMes(mesSeleccionado, anioSeleccionado);
      aplicarFiltros({
        fechaDesde,
        fechaHasta,
        pageNumber: 1,
        pageSize: pageSize,
        sortBy: 'fecha',
      } as MovimientoFiltros);
      setPage(0); // Resetear a la primera página cuando cambia el mes
    }
  }, [mesSeleccionado, anioSeleccionado]);

  // Resetear a página 1 cuando cambia el tamaño de página
  useEffect(() => {
    if (filtros && pageSize && mesSeleccionado && anioSeleccionado) {
      const { fechaDesde, fechaHasta } = getFechasDelMes(mesSeleccionado, anioSeleccionado);
      aplicarFiltros({
        ...filtros,
        fechaDesde,
        fechaHasta,
        pageNumber: 1,
        pageSize: pageSize,
        sortBy: filtros.sortBy || 'fecha',
      } as MovimientoFiltros);
      setPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const handleRefresh = () => {
    fetchInfoIniciales();
    if (mesSeleccionado && anioSeleccionado) {
      fetchReporteMensual({ anio: anioSeleccionado, mes: mesSeleccionado });
      const { fechaDesde, fechaHasta } = getFechasDelMes(mesSeleccionado, anioSeleccionado);
      aplicarFiltros({
        fechaDesde,
        fechaHasta,
        pageNumber: 1,
        pageSize: pageSize,
        sortBy: 'fecha',
      } as MovimientoFiltros);
      setPage(0);
    }
  };

  // Obtener movimientos y metadatos
  const movimientosDelMes = movimientosData?.data?.[0]?.movimientos || [];
  const metadata = movimientosData?.metadata;

  // Determinar el total de movimientos:
  // 1. Si metadata.count existe y es mayor que 0, usar ese (es el valor correcto del backend)
  // 2. Si no, usar la cantidad de movimientos devueltos
  const totalMovimientosDelBackend = metadata?.count && metadata.count > 0 ? metadata.count : movimientosDelMes.length;
  const totalMovimientos = totalMovimientosDelBackend;

  // Calcular totalPages basado en el totalMovimientos y pageSize
  // Si el backend proporciona totalPages y es mayor que 0, usarlo; sino calcularlo
  const totalPagesCalculado = Math.max(1, Math.ceil(totalMovimientos / pageSize));
  const totalPages = metadata?.totalPages && metadata.totalPages > 0 ? metadata.totalPages : totalPagesCalculado;
  const currentPageNumber = metadata?.pageNumber || 1;

  // Sincronizar el estado de página con los metadatos del servidor
  useEffect(() => {
    if (currentPageNumber > 0 && page !== currentPageNumber - 1) {
      setPage(currentPageNumber - 1); // Convertir de 1-indexed a 0-indexed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageNumber]);

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (filtros && mesSeleccionado && anioSeleccionado) {
      const { fechaDesde, fechaHasta } = getFechasDelMes(mesSeleccionado, anioSeleccionado);
      aplicarFiltros({
        ...filtros,
        fechaDesde,
        fechaHasta,
        pageNumber: newPage + 1, // Convertir de 0-indexed a 1-indexed para el backend
        pageSize: pageSize,
        sortBy: filtros.sortBy || 'fecha',
      });
    }
  };

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
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

  const handleSeleccionarMes = (mes: string, anio: number) => {
    setMesSeleccionado(mes);
    setAnioSeleccionado(anio);
    setMesMenuVisible(false);
  };

  const isLoading = reporteLoading || movimientosLoading || loadingInfoInicial;

  return (
    <View style={styles.container}>
      
      <Header title="Consultas Históricas" onBack={() => router.back()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
      >
        {/* Selector de Mes */}
        <Card style={styles.selectorCard}>
          <Card.Content>
            <View style={styles.selectorHeader}>
              <MaterialCommunityIcons name="calendar-month" size={24} color="#6CB4EE" />
              <Text variant="titleMedium" style={styles.selectorTitle}>
                Seleccionar Mes
              </Text>
            </View>
            <Menu
              visible={mesMenuVisible}
              onDismiss={() => setMesMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setMesMenuVisible(true)}
                >
                  <Text variant="bodyLarge" style={styles.selectorButtonText}>
                    {mesSeleccionado} {anioSeleccionado}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={24} color="#666666" />
                </TouchableOpacity>
              }
              contentStyle={styles.menuContent}
            >
              {infoInicialesDisponibles.length === 0 ? (
                <View style={styles.emptyMenu}>
                  <Text variant="bodyMedium" style={styles.emptyMenuText}>
                    No hay meses disponibles
                  </Text>
                </View>
              ) : (
                infoInicialesDisponibles
                  .sort((a, b) => {
                    // Ordenar por año y mes (más reciente primero)
                    if (a.anio !== b.anio) return b.anio - a.anio;
                    return meses.indexOf(b.mes) - meses.indexOf(a.mes);
                  })
                  .map((info) => (
                    <Menu.Item
                      key={info.id}
                      onPress={() => handleSeleccionarMes(info.mes, info.anio)}
                      title={`${info.mes} ${info.anio}`}
                      titleStyle={styles.menuItemText}
                    />
                  ))
              )}
            </Menu>
          </Card.Content>
        </Card>

        {/* Dashboard - Resumen Principal */}
        {reporteData && (
          <>
            {/* Cards de Resumen */}
            <ResumenCards
              totalIngresos={reporteData.totalIngresos}
              totalEgresos={reporteData.totalEgresos}
            />

            {/* Balance Total */}
            <BalanceCard balanceTotal={reporteData.balanceTotal} balanceMes={reporteData.balance} />

            {/* Comparación con Mes Anterior */}
            {reporteData.comparacionMesAnterior && (
              <ComparacionMesAnterior comparacion={reporteData.comparacionMesAnterior} />
            )}

            {/* Gráfico de Torta */}
            {reporteData.resumenPorCategoria && reporteData.resumenPorCategoria.length > 0 && (
              <GraficoTortaCategorias data={reporteData.resumenPorCategoria} />
            )}

            {/* Top 5 Categorías */}
            {reporteData.top5Categorias && reporteData.top5Categorias.length > 0 && (
              <Top5Categorias categorias={reporteData.top5Categorias} />
            )}

            {/* Saldos por Medio de Pago */}
            {reporteData.saldosPorMedioPago && reporteData.saldosPorMedioPago.length > 0 && (
              <SaldosPorMedioPago saldos={reporteData.saldosPorMedioPago} showDetails={false} />
            )}
          </>
        )}

        {/* Lista de Movimientos */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6CB4EE" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Cargando movimientos...
            </Text>
          </View>
        ) : movimientosError || reporteError ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <MaterialCommunityIcons name="alert-circle" size={48} color="#E74C3C" />
              <Text variant="bodyLarge" style={styles.errorText}>
                Error al cargar los datos
              </Text>
              <Text variant="bodySmall" style={styles.errorSubtext}>
                {movimientosError || reporteError}
              </Text>
            </Card.Content>
          </Card>
        ) : movimientosDelMes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <MaterialCommunityIcons name="inbox" size={48} color="#CCCCCC" />
              <Text variant="bodyLarge" style={styles.emptyText}>
                No hay movimientos
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                No se encontraron movimientos para {mesSeleccionado} {anioSeleccionado}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.movimientosContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#6CB4EE" />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Movimientos ({movimientosDelMes.length})
              </Text>
            </View>
            {movimientosDelMes.map((movimiento) => {
              const isExpanded = movimientosExpandidos.has(movimiento.id);
              return (
                <MovimientoCard
                  key={movimiento.id}
                  movimiento={movimiento}
                  isExpanded={isExpanded}
                  onPress={() => toggleMovimientoExpandido(movimiento.id)}
                  onEdit={(id) => {
                    setMovimientoSeleccionado(id);
                    setIsMovimientoModalVisible(true);
                  }}
                  menuVisible={false}
                  showMenu={false}
                />
              );
            })}

            {/* Paginación */}
            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalMovimientos={totalMovimientos}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              movimientosLength={movimientosDelMes.length}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Editar Movimiento */}
      <MovimientoModal
        visible={isMovimientoModalVisible}
        onDismiss={() => {
          setIsMovimientoModalVisible(false);
          setMovimientoSeleccionado(null);
        }}
        movimientoId={movimientoSeleccionado}
        onSuccess={() => {
          handleRefresh();
          setMovimientoSeleccionado(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  selectorCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  selectorTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectorButtonText: {
    color: '#333333',
    fontWeight: '500',
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
  },
  menuItemText: {
    color: '#333333',
  },
  emptyMenu: {
    padding: 16,
    alignItems: 'center',
  },
  emptyMenuText: {
    color: '#666666',
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
  movimientosContainer: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  errorText: {
    marginTop: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    color: '#666666',
    textAlign: 'center',
  },
  emptyCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  emptyText: {
    marginTop: 16,
    color: '#666666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999999',
    textAlign: 'center',
  },
});
