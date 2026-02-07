import { CategoriaModal } from '@/components/categoria-modal';
import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { MedioPagoModal } from '@/components/medio-pago-modal';
import { PaginationBar } from '@/components/pagination-bar';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';
import { MovimientoCard } from '@/features/movimiento/components/movimiento-card';
import { MovimientoModal } from '@/features/movimiento/components/movimiento-modal';
import { useDeleteMovimiento, useMovimientosConFiltros } from '@/features/movimiento/hooks/movimiento.hook';
import { MovimientoFiltros, TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, FAB, Menu, Text } from 'react-native-paper';
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
  const [isCategoriaModalVisible, setIsCategoriaModalVisible] = useState(false);
  const [isMedioPagoModalVisible, setIsMedioPagoModalVisible] = useState(false);
  const [tipoMovimientoMenuVisible, setTipoMovimientoMenuVisible] = useState(false);
  const [mesMenuVisible, setMesMenuVisible] = useState(false);
  const [page, setPage] = useState(0); // 0-indexed para el componente DataTable
  const [pageSize, setPageSize] = useState(10);
  const insets = useSafeAreaInsets();

  const { data: movimientosData, loading: movimientosLoading, error: movimientosError, aplicarFiltros, limpiarFiltros, filtros } = useMovimientosConFiltros();
  const { deleteMovimiento, loading: deleting } = useDeleteMovimiento();
  const { data: categorias } = useCategorias({ activo: true });
  const { data: mediosPago } = useMediosPago();
  const { data: infoIniciales, fetch: fetchInfoIniciales } = useInfoInicialPorUsuario();

  // Cargar info iniciales y movimientos al montar el componente
  useEffect(() => {
    fetchInfoIniciales();
    aplicarFiltros({
      pageNumber: 1,
      pageSize: pageSize,
      sortBy: 'fecha',
    } as MovimientoFiltros);
  }, []);

  // Resetear a página 1 cuando cambia el tamaño de página
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  // Obtener movimientos y metadatos
  const movimientosDelMes = movimientosData?.data?.[0]?.movimientos || [];
  const metadata = movimientosData?.metadata;

  // Determinar el total de movimientos:
  // 1. Si metadata.count existe y es mayor que 0, usar ese (es el valor correcto del backend)
  // 2. Si no, usar la cantidad de movimientos devueltos
  // Si el backend devuelve todos los registros aunque se solicite paginación,
  // pero metadata.count tiene el valor correcto, usamos metadata.count
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
        const filtrosActuales: MovimientoFiltros = filtros || {
          pageNumber: 1,
          pageSize: pageSize,
          sortBy: 'fecha',
        };
        aplicarFiltros({
          ...filtrosActuales,
          pageNumber: filtrosActuales.pageNumber || 1,
          pageSize: pageSize,
          sortBy: filtrosActuales.sortBy || 'fecha',
        });
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

  const handleAplicarFiltros = () => {
    const filtrosLimpios: MovimientoFiltros = {
      pageNumber: 1,
      pageSize: pageSize,
      sortBy: 'fecha',
      infoInicialId: filtrosTemporales.infoInicialId,
      tipoMovimiento: filtrosTemporales.tipoMovimiento,
      categoriaId: filtrosTemporales.categoriaId,
      medioPagoId: filtrosTemporales.medioPagoId,
      fechaDesde: filtrosTemporales.fechaDesde,
      fechaHasta: filtrosTemporales.fechaHasta,
    };
    aplicarFiltros(filtrosLimpios);
    setFiltrosExpandidos(false);
    setPage(0); // Resetear a la primera página cuando se aplican filtros
  };

  const handleLimpiarFiltros = () => {
    // Limpiar solo los filtros temporales (sin paginación)
    setFiltrosTemporales({});
    // Aplicar filtros limpios con paginación reseteada
    aplicarFiltros({
      pageNumber: 1,
      pageSize: pageSize,
      sortBy: 'fecha',
    } as MovimientoFiltros);
    setFiltrosExpandidos(false);
    setPage(0); // Resetear a la primera página cuando se limpian filtros
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (filtros) {
      aplicarFiltros({
        ...filtros,
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

  // Usar filtros aplicados si existen, sino usar filtros temporales (para mostrar la selección antes de aplicar)
  const categoriaIdParaMostrar = filtros?.categoriaId ?? filtrosTemporales.categoriaId;
  const medioPagoIdParaMostrar = filtros?.medioPagoId ?? filtrosTemporales.medioPagoId;
  const infoInicialIdParaMostrar = filtros?.infoInicialId ?? filtrosTemporales.infoInicialId;

  const categoriaSeleccionada = categorias?.find((c) => c.id === categoriaIdParaMostrar);
  const medioPagoSeleccionado = mediosPago?.find((m) => m.id === medioPagoIdParaMostrar);
  const infoInicialSeleccionada = infoIniciales?.find((info) => info.id === infoInicialIdParaMostrar);

  // Verificar si hay filtros activos (excluyendo paginación y ordenamiento)
  const tieneFiltrosActivos =
    filtros &&
    (filtros.infoInicialId !== undefined ||
      filtros.tipoMovimiento !== undefined ||
      filtros.categoriaId !== undefined ||
      filtros.medioPagoId !== undefined ||
      filtros.fechaDesde !== undefined ||
      filtros.fechaHasta !== undefined);

  // Formatear mes para mostrar en el selector
  const formatMesSelector = (mes: string, anio: number) => {
    return `${mes} ${anio}`;
  };

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
          <RefreshControl
            refreshing={movimientosLoading}
            onRefresh={() => {
              const filtrosActuales: MovimientoFiltros = filtros || {
                pageNumber: 1,
                pageSize: pageSize,
                sortBy: 'fecha',
              };
              aplicarFiltros(filtrosActuales);
            }}
          />
        }
      >
        {/* Formulario de Filtros */}
        {filtrosExpandidos && (
          <Card style={styles.filtrosCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.filtrosTitle}>
                Filtrar movimientos
              </Text>

              {/* Mes */}
              <View style={styles.filterRow}>
                <Text variant="bodyMedium" style={styles.filterLabel}>
                  Mes
                </Text>
                <Menu
                  visible={mesMenuVisible}
                  onDismiss={() => setMesMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      style={styles.filterSelect}
                      onPress={() => setMesMenuVisible(true)}
                    >
                      <Text style={styles.filterSelectText}>
                        {infoInicialSeleccionada
                          ? formatMesSelector(infoInicialSeleccionada.mes, infoInicialSeleccionada.anio)
                          : 'Seleccionar mes'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
                    </TouchableOpacity>
                  }
                  contentStyle={styles.menuDropdownContent}
                >
                  <Menu.Item
                    onPress={() => {
                      setFiltrosTemporales({ ...filtrosTemporales, infoInicialId: undefined });
                      setMesMenuVisible(false);
                    }}
                    title="Todos los meses"
                  />
                  {infoIniciales?.map((info) => (
                    <Menu.Item
                      key={info.id}
                      onPress={() => {
                        setFiltrosTemporales({ ...filtrosTemporales, infoInicialId: info.id });
                        setMesMenuVisible(false);
                      }}
                      title={formatMesSelector(info.mes, info.anio)}
                    />
                  ))}
                </Menu>
              </View>

              {/* Tipo de Movimiento */}
              <View style={styles.filterRow}>
                <Text variant="bodyMedium" style={styles.filterLabel}>
                  Tipo de movimiento
                </Text>
                <Menu
                  visible={tipoMovimientoMenuVisible}
                  onDismiss={() => setTipoMovimientoMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      style={styles.filterSelect}
                      onPress={() => setTipoMovimientoMenuVisible(true)}
                    >
                      <Text style={styles.filterSelectText}>
                        {filtrosTemporales.tipoMovimiento === TipoMovimientoEnum.INGRESO
                          ? 'Ingreso'
                          : filtrosTemporales.tipoMovimiento === TipoMovimientoEnum.EGRESO
                            ? 'Egreso'
                            : '--'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
                    </TouchableOpacity>
                  }
                  contentStyle={styles.menuDropdownContent}
                >
                  <Menu.Item
                    onPress={() => {
                      setFiltrosTemporales({ ...filtrosTemporales, tipoMovimiento: undefined });
                      setTipoMovimientoMenuVisible(false);
                    }}
                    title="Todos"
                  />
                  <Menu.Item
                    onPress={() => {
                      setFiltrosTemporales({ ...filtrosTemporales, tipoMovimiento: TipoMovimientoEnum.INGRESO });
                      setTipoMovimientoMenuVisible(false);
                    }}
                    title="Ingreso"
                  />
                  <Menu.Item
                    onPress={() => {
                      setFiltrosTemporales({ ...filtrosTemporales, tipoMovimiento: TipoMovimientoEnum.EGRESO });
                      setTipoMovimientoMenuVisible(false);
                    }}
                    title="Egreso"
                  />
                </Menu>
              </View>

              {/* Categoría */}
              <View style={styles.filterRow}>
                <Text variant="bodyMedium" style={styles.filterLabel}>
                  Categoría
                </Text>
                <TouchableOpacity
                  style={styles.filterSelect}
                  onPress={() => setIsCategoriaModalVisible(true)}
                >
                  <Text style={styles.filterSelectText}>
                    {categoriaSeleccionada?.nombre || 'Seleccionar categoría'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* Medio de Pago */}
              <View style={styles.filterRow}>
                <Text variant="bodyMedium" style={styles.filterLabel}>
                  Medio de pago
                </Text>
                <TouchableOpacity
                  style={styles.filterSelect}
                  onPress={() => setIsMedioPagoModalVisible(true)}
                >
                  <Text style={styles.filterSelectText}>
                    {medioPagoSeleccionado?.nombre || 'Seleccionar medio de pago'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* Botones */}
              <View style={styles.filterActions}>
                <Button
                  mode="outlined"
                  onPress={handleLimpiarFiltros}
                  style={styles.filterButtonAction}
                  textColor="#666666"
                >
                  Limpiar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAplicarFiltros}
                  style={styles.filterButtonAction}
                  buttonColor="#6CB4EE"
                >
                  Aplicar
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

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
                <TouchableOpacity
                  onPress={() => {
                    const filtrosActuales: MovimientoFiltros = filtros || {
                      pageNumber: 1,
                      pageSize: pageSize,
                      sortBy: 'fecha',
                    };
                    aplicarFiltros(filtrosActuales);
                  }}
                  style={styles.retryButton}
                >
                  <Text variant="bodyMedium" style={styles.retryButtonText}>
                    Reintentar
                  </Text>
                </TouchableOpacity>
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
                  {tieneFiltrosActivos
                    ? 'No se encontraron movimientos con los filtros aplicados'
                    : 'No hay movimientos registrados'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <>
            <View style={styles.movimientosContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Movimientos ({totalMovimientos})
              </Text>
              {movimientosDelMes.map((movimiento) => {
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
          </>
        )}
      </ScrollView>

      {/* Modal de Categoría */}
      <CategoriaModal
        visible={isCategoriaModalVisible}
        onDismiss={() => setIsCategoriaModalVisible(false)}
        onSelect={(categoria) => {
          setFiltrosTemporales({ ...filtrosTemporales, categoriaId: categoria.id });
          setIsCategoriaModalVisible(false);
        }}
        selectedValue={filtrosTemporales.categoriaId}
      />

      {/* Modal de Medio de Pago */}
      <MedioPagoModal
        visible={isMedioPagoModalVisible}
        onDismiss={() => setIsMedioPagoModalVisible(false)}
        onSelect={(medio) => {
          setFiltrosTemporales({ ...filtrosTemporales, medioPagoId: medio.id });
          setIsMedioPagoModalVisible(false);
        }}
        selectedValue={filtrosTemporales.medioPagoId}
      />

      {/* Botón FAB para crear movimiento */}
      <FAB
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => setIsMovimientoModalVisible(true)}
        color="#FFFFFF"
      />

      {/* Modal de Crear/Editar Movimiento */}
      <MovimientoModal
        visible={isMovimientoModalVisible}
        onDismiss={() => {
          setIsMovimientoModalVisible(false);
          setMovimientoSeleccionado(null);
        }}
        movimientoId={movimientoSeleccionado}
        onSuccess={() => {
          const filtrosActuales: MovimientoFiltros = filtros || {
            pageNumber: 1,
            pageSize: pageSize,
            sortBy: 'fecha',
          };
          aplicarFiltros({
            ...filtrosActuales,
            pageNumber: filtrosActuales.pageNumber || 1,
            pageSize: pageSize,
            sortBy: filtrosActuales.sortBy || 'fecha',
          });
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
  filtrosCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  filtrosTitle: {
    marginBottom: 16,
    fontWeight: '600',
    color: '#333333',
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    color: '#666666',
    fontWeight: '500',
  },
  filterInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterSelectContainer: {
    position: 'relative',
  },
  filterSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterSelectText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  filterButtonAction: {
    flex: 1,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#6CB4EE',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  menuDropdownContent: {
    backgroundColor: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#6CB4EE',
  },
});