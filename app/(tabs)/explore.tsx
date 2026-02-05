import { CategoriaModal } from '@/components/categoria-modal';
import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { MedioPagoModal } from '@/components/medio-pago-modal';
import { MovimientoModal } from '@/components/movimiento-modal';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';
import { useDeleteMovimiento, useMovimientosConFiltros } from '@/features/movimiento/hooks/movimiento.hook';
import { MovimientoFiltros, TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Card, FAB, Menu, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const [isMovimientoModalVisible, setIsMovimientoModalVisible] = useState(false);
  const [isConfirmacionModalVisible, setIsConfirmacionModalVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [movimientosExpandidos, setMovimientosExpandidos] = useState<Set<number>>(new Set());
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);
  const [filtrosTemporales, setFiltrosTemporales] = useState<MovimientoFiltros>({});
  const [isCategoriaModalVisible, setIsCategoriaModalVisible] = useState(false);
  const [isMedioPagoModalVisible, setIsMedioPagoModalVisible] = useState(false);
  const [tipoMovimientoMenuVisible, setTipoMovimientoMenuVisible] = useState(false);
  const [mesMenuVisible, setMesMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const { data: movimientosData, loading: movimientosLoading, error: movimientosError, aplicarFiltros, limpiarFiltros, filtros } = useMovimientosConFiltros();
  const { deleteMovimiento, loading: deleting } = useDeleteMovimiento();
  const { data: categorias } = useCategorias({ activo: true });
  const { data: mediosPago } = useMediosPago();
  const { data: infoIniciales, fetch: fetchInfoIniciales } = useInfoInicialPorUsuario();

  // Cargar info iniciales y movimientos al montar el componente
  useEffect(() => {
    fetchInfoIniciales();
    aplicarFiltros({});
  }, []);

  // Obtener movimientos
  const movimientosDelMes = movimientosData?.data?.[0]?.movimientos || [];

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
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
        aplicarFiltros(filtros || {});
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
    const filtrosLimpios: MovimientoFiltros = {};
    if (filtrosTemporales.infoInicialId) filtrosLimpios.infoInicialId = filtrosTemporales.infoInicialId;
    if (filtrosTemporales.tipoMovimiento) filtrosLimpios.tipoMovimiento = filtrosTemporales.tipoMovimiento;
    if (filtrosTemporales.categoriaId) filtrosLimpios.categoriaId = filtrosTemporales.categoriaId;
    if (filtrosTemporales.medioPagoId) filtrosLimpios.medioPagoId = filtrosTemporales.medioPagoId;
    if (filtrosTemporales.fechaDesde) filtrosLimpios.fechaDesde = filtrosTemporales.fechaDesde;
    if (filtrosTemporales.fechaHasta) filtrosLimpios.fechaHasta = filtrosTemporales.fechaHasta;
    aplicarFiltros(filtrosLimpios);
    setFiltrosExpandidos(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltrosTemporales({});
    limpiarFiltros();
    setFiltrosExpandidos(false);
  };

  const categoriaSeleccionada = categorias?.find((c) => c.id === filtrosTemporales.categoriaId);
  const medioPagoSeleccionado = mediosPago?.find((m) => m.id === filtrosTemporales.medioPagoId);
  const infoInicialSeleccionada = infoIniciales?.find((info) => info.id === filtrosTemporales.infoInicialId);

  const tieneFiltrosActivos = filtros && Object.keys(filtros).length > 0;

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
          <RefreshControl refreshing={movimientosLoading} onRefresh={() => aplicarFiltros(filtros || {})} />
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
                  onPress={() => aplicarFiltros(filtros || {})}
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

      {/* Modal de Categoría */}
      <CategoriaModal
        visible={isCategoriaModalVisible}
        onDismiss={() => setIsCategoriaModalVisible(false)}
        onSelect={(categoriaId) => {
          setFiltrosTemporales({ ...filtrosTemporales, categoriaId });
          setIsCategoriaModalVisible(false);
        }}
        selectedValue={filtrosTemporales.categoriaId}
      />

      {/* Modal de Medio de Pago */}
      <MedioPagoModal
        visible={isMedioPagoModalVisible}
        onDismiss={() => setIsMedioPagoModalVisible(false)}
        onSelect={(medioPagoId) => {
          setFiltrosTemporales({ ...filtrosTemporales, medioPagoId });
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
          aplicarFiltros(filtros || {});
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
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#6CB4EE',
  },
});
