import { Header } from '@/components/ui/header';
import {
  GastosFijosHistoricoList,
  MesSelectorCard,
  MovimientosHistoricoList,
  ResumenHistoricoSection,
} from '@/features/consultas-historicas/components';
import { getFechasDelMes } from '@/features/consultas-historicas/utils/meses';
import { usePagosPorInfoInicial } from '@/features/gasto-fijo/hooks/pago-gasto-fijo.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useMovimientosConFiltros } from '@/features/movimiento/hooks/movimiento.hook';
import { MovimientoFiltros } from '@/features/movimiento/interfaces/movimiento.interface';
import { useReporteMensual } from '@/features/reporte/hooks/reporte.hook';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function ConsultasHistoricasScreen() {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(getCurrentMonth());
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(getCurrentYear());
  const [mesMenuVisible, setMesMenuVisible] = useState(false);
  const [movimientosExpandidos, setMovimientosExpandidos] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data: infoIniciales, loading: loadingInfoInicial, fetch: fetchInfoIniciales } =
    useInfoInicialPorUsuario();
  const { data: reporteData, loading: reporteLoading, error: reporteError, fetchReporteMensual } =
    useReporteMensual();
  const {
    data: movimientosData,
    loading: movimientosLoading,
    error: movimientosError,
    aplicarFiltros,
    filtros,
  } = useMovimientosConFiltros();

  const infoInicialesDisponibles = infoIniciales ?? [];
  const infoInicialSeleccionado = infoInicialesDisponibles.find(
    (info) => info.mes === mesSeleccionado && info.anio === anioSeleccionado
  );
  const infoInicialId = infoInicialSeleccionado?.id ?? null;

  const { pagos: gastosFijosPagos, fetchPagosPorInfoInicial } = usePagosPorInfoInicial(infoInicialId);

  const cargarMovimientos = useCallback(
    (pageNumber: number, size: number) => {
      const { fechaDesde, fechaHasta } = getFechasDelMes(mesSeleccionado, anioSeleccionado);
      aplicarFiltros({
        fechaDesde,
        fechaHasta,
        pageNumber,
        pageSize: size,
        sortBy: 'fecha',
      } as MovimientoFiltros);
    },
    [mesSeleccionado, anioSeleccionado, aplicarFiltros]
  );

  useEffect(() => {
    fetchInfoIniciales();
    // fetchInfoIniciales no es estable (se recrea cada render), solo ejecutar al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mesSeleccionado && anioSeleccionado) {
      fetchReporteMensual({ anio: anioSeleccionado, mes: mesSeleccionado });
      cargarMovimientos(1, pageSize);
      setPage(0);
    }
  }, [mesSeleccionado, anioSeleccionado]);

  useEffect(() => {
    if (infoInicialId != null) {
      fetchPagosPorInfoInicial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoInicialId]);

  useEffect(() => {
    if (mesSeleccionado && anioSeleccionado) {
      cargarMovimientos(1, pageSize);
      setPage(0);
    }
    // Solo al cambiar pageSize
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const handleRefresh = useCallback(() => {
    fetchInfoIniciales();
    if (mesSeleccionado && anioSeleccionado) {
      fetchReporteMensual({ anio: anioSeleccionado, mes: mesSeleccionado });
      cargarMovimientos(1, pageSize);
      setPage(0);
      if (infoInicialId != null) {
        fetchPagosPorInfoInicial();
      }
    }
  }, [fetchInfoIniciales, fetchReporteMensual, mesSeleccionado, anioSeleccionado, cargarMovimientos, pageSize, infoInicialId, fetchPagosPorInfoInicial]);

  const handleSeleccionarMes = (mes: string, anio: number) => {
    setMesSeleccionado(mes);
    setAnioSeleccionado(anio);
    setMesMenuVisible(false);
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (filtros && mesSeleccionado && anioSeleccionado) {
      cargarMovimientos(newPage + 1, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  // Datos de movimientos
  const movimientosDelMes = movimientosData?.data?.[0]?.movimientos ?? [];
  const metadata = movimientosData?.metadata;
  const totalMovimientos =
    metadata?.count && metadata.count > 0 ? metadata.count : movimientosDelMes.length;
  const totalPagesCalculado = Math.max(1, Math.ceil(totalMovimientos / pageSize));
  const totalPages =
    metadata?.totalPages && metadata.totalPages > 0 ? metadata.totalPages : totalPagesCalculado;
  const currentPageNumber = metadata?.pageNumber ?? 1;

  useEffect(() => {
    if (currentPageNumber > 0 && page !== currentPageNumber - 1) {
      setPage(currentPageNumber - 1);
    }
    // No incluir page para evitar bucle: solo sincronizar cuando cambie metadata del servidor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageNumber]);

  const isLoading = reporteLoading || movimientosLoading || loadingInfoInicial;
  const errorMensaje = movimientosError ?? reporteError ?? undefined;

  return (
    <View style={styles.container}>
      <Header title="Resumen Mensual" onBack={() => router.back()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        <MesSelectorCard
          mesSeleccionado={mesSeleccionado}
          anioSeleccionado={anioSeleccionado}
          mesesDisponibles={infoInicialesDisponibles}
          menuVisible={mesMenuVisible}
          onMenuOpen={() => setMesMenuVisible(true)}
          onMenuClose={() => setMesMenuVisible(false)}
          onSeleccionarMes={handleSeleccionarMes}
        />

        <ResumenHistoricoSection reporte={reporteData ?? null} />

        <GastosFijosHistoricoList
          pagos={gastosFijosPagos}
          mesSeleccionado={mesSeleccionado}
          anioSeleccionado={anioSeleccionado}
        />

        <MovimientosHistoricoList
          movimientos={movimientosDelMes}
          totalMovimientos={totalMovimientos}
          totalPages={totalPages}
          page={page}
          pageSize={pageSize}
          mesSeleccionado={mesSeleccionado}
          anioSeleccionado={anioSeleccionado}
          movimientosExpandidos={movimientosExpandidos}
          loading={movimientosLoading}
          error={errorMensaje}
          onToggleExpand={toggleMovimientoExpandido}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRetry={handleRefresh}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});
