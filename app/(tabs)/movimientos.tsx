import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { PaginationBar } from '@/components/pagination-bar';
import {
  AddFAB,
  EmptyStateCard,
  ErrorStateCard,
  LoadingStateBlock,
} from '@/common/components';
import { MovimientoCard } from '@/features/movimiento/components/movimiento-card';
import { MovimientosFilterCard } from '@/features/movimiento/components/movimientos-filter-card';
import { MovimientoModal } from '@/features/movimiento/components/movimiento-modal';
import {
  useDeleteMovimiento,
  useMovimientosConFiltros,
} from '@/features/movimiento/hooks/movimiento.hook';
import { MovimientoFiltros } from '@/features/movimiento/interfaces/movimiento.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ExploreScreen() {
  const [isMovimientoModalVisible, setIsMovimientoModalVisible] = useState(false);
  const [isConfirmacionModalVisible, setIsConfirmacionModalVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [movimientosExpandidos, setMovimientosExpandidos] = useState<Set<number>>(new Set());
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);
  const [filtrosTemporales, setFiltrosTemporales] = useState<Partial<MovimientoFiltros>>({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const insets = useSafeAreaInsets();

  const {
    data: movimientosData,
    loading: movimientosLoading,
    error: movimientosError,
    aplicarFiltros,
    filtros,
  } = useMovimientosConFiltros();
  const { deleteMovimiento, loading: deleting } = useDeleteMovimiento();

  useEffect(() => {
    aplicarFiltros({
      pageNumber: 1,
      pageSize: pageSize,
      sortBy: 'fecha',
    } as MovimientoFiltros);
  }, []);

  useEffect(() => {
    if (filtros && pageSize) {
      aplicarFiltros({
        ...filtros,
        pageNumber: 1,
        pageSize: pageSize,
        sortBy: filtros.sortBy || 'fecha',
      } as MovimientoFiltros);
      setPage(0);
    }
  }, [pageSize]);

  const movimientosDelMes = movimientosData?.data?.[0]?.movimientos || [];
  const metadata = movimientosData?.metadata;
  const totalMovimientos =
    metadata?.count && metadata.count > 0 ? metadata.count : movimientosDelMes.length;
  const totalPages =
    metadata?.totalPages && metadata.totalPages > 0
      ? metadata.totalPages
      : Math.max(1, Math.ceil(totalMovimientos / pageSize));
  const currentPageNumber = metadata?.pageNumber || 1;

  useEffect(() => {
    if (currentPageNumber > 0 && page !== currentPageNumber - 1) {
      setPage(currentPageNumber - 1);
    }
  }, [currentPageNumber]);

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

  const handleRefresh = () => {
    aplicarFiltros(
      (filtros || { pageNumber: 1, pageSize, sortBy: 'fecha' }) as MovimientoFiltros
    );
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
        handleRefresh();
      } catch {
        // El error ya se maneja en el hook
      }
    }
  };

  const toggleMovimientoExpandido = (movimientoId: number) => {
    setMovimientosExpandidos((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(movimientoId)) nuevo.delete(movimientoId);
      else nuevo.add(movimientoId);
      return nuevo;
    });
  };

  const handleAplicarFiltros = () => {
    aplicarFiltros({
      pageNumber: 1,
      pageSize: pageSize,
      sortBy: 'fecha',
      infoInicialId: filtrosTemporales.infoInicialId,
      tipoMovimiento: filtrosTemporales.tipoMovimiento,
      categoriaId: filtrosTemporales.categoriaId,
      medioPagoId: filtrosTemporales.medioPagoId,
      fechaDesde: filtrosTemporales.fechaDesde,
      fechaHasta: filtrosTemporales.fechaHasta,
    } as MovimientoFiltros);
    setFiltrosExpandidos(false);
    setPage(0);
  };

  const handleLimpiarFiltros = () => {
    setFiltrosTemporales({});
    aplicarFiltros({ pageNumber: 1, pageSize: pageSize, sortBy: 'fecha' } as MovimientoFiltros);
    setFiltrosExpandidos(false);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (filtros) {
      aplicarFiltros({
        ...filtros,
        pageNumber: newPage + 1,
        pageSize: pageSize,
        sortBy: filtros.sortBy || 'fecha',
      });
    }
  };

  const tieneFiltrosActivos =
    filtros &&
    (filtros.infoInicialId !== undefined ||
      filtros.tipoMovimiento !== undefined ||
      filtros.categoriaId !== undefined ||
      filtros.medioPagoId !== undefined ||
      filtros.fechaDesde !== undefined ||
      filtros.fechaHasta !== undefined);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="headlineSmall" style={styles.title}>
            Movimientos
          </Text>
          <TouchableOpacity
            onPress={() => setFiltrosExpandidos(!filtrosExpandidos)}
            style={styles.filterButton}
          >
            <MaterialCommunityIcons
              name={filtrosExpandidos ? 'filter' : 'filter-outline'}
              size={24}
              color={tieneFiltrosActivos ? '#6CB4EE' : '#666666'}
            />
            {tieneFiltrosActivos && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>
        {tieneFiltrosActivos && (
          <TouchableOpacity onPress={handleLimpiarFiltros} style={styles.clearFiltersButton}>
            <MaterialCommunityIcons name="close-circle" size={16} color="#6CB4EE" />
            <Text variant="bodySmall" style={styles.clearFiltersText}>
              Limpiar filtros
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido principal */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={movimientosLoading} onRefresh={handleRefresh} />
        }
      >
        {filtrosExpandidos && (
          <MovimientosFilterCard
            filtrosTemporales={filtrosTemporales}
            onFiltrosChange={setFiltrosTemporales}
            onAplicar={handleAplicarFiltros}
            onLimpiar={handleLimpiarFiltros}
          />
        )}

        {movimientosLoading ? (
          <LoadingStateBlock message="Cargando movimientos..." />
        ) : movimientosError ? (
          <ErrorStateCard message={movimientosError} onRetry={handleRefresh} />
        ) : movimientosDelMes.length === 0 ? (
          <EmptyStateCard
            icon="wallet-outline"
            title="No hay movimientos"
            description={
              tieneFiltrosActivos
                ? 'No se encontraron movimientos con los filtros aplicados'
                : 'No hay movimientos registrados'
            }
          />
        ) : (
          <>
            <View style={styles.movimientosContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Movimientos ({totalMovimientos})
              </Text>
              {movimientosDelMes.map((movimiento) => (
                <MovimientoCard
                  key={movimiento.id}
                  movimiento={movimiento}
                  isExpanded={movimientosExpandidos.has(movimiento.id)}
                  onPress={() => toggleMovimientoExpandido(movimiento.id)}
                  onEdit={handleEditarMovimiento}
                  onDelete={handleEliminarMovimiento}
                  menuVisible={menuVisible === movimiento.id}
                  onMenuOpen={() => setMenuVisible(movimiento.id)}
                  onMenuClose={() => setMenuVisible(null)}
                  showMenu
                />
              ))}
            </View>

            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalMovimientos={totalMovimientos}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
              movimientosLength={movimientosDelMes.length}
            />
          </>
        )}
      </ScrollView>

      <AddFAB onPress={() => setIsMovimientoModalVisible(true)} />

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
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  filterButton: {
    padding: 4,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6CB4EE',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  clearFiltersText: {
    color: '#6CB4EE',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  movimientosContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#333333',
  },
});
