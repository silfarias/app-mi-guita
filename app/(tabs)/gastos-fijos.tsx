import {
  AddFAB,
  EmptyStateCard,
  ErrorStateCard,
  LoadingStateBlock,
} from '@/common/components';
import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { PaginationBar } from '@/components/pagination-bar';
import { GastoFijoCard } from '@/features/gasto-fijo/components/gasto-fijo-card';
import { GastoFijoModal } from '@/features/gasto-fijo/components/gasto-fijo-modal';
import { GastoFijoPagoCard } from '@/features/gasto-fijo/components/gasto-fijo-pago-card';
import { MontoPagoModal } from '@/features/gasto-fijo/components/monto-pago-modal';
import { useDeleteGastoFijo, useMisGastosFijos } from '@/features/gasto-fijo/hooks/gasto-fijo.hook';
import {
  usePagosPorInfoInicial,
  useUpdatePagoGastoFijo,
} from '@/features/gasto-fijo/hooks/pago-gasto-fijo.hook';
import { PagoGastoFijoPorGastoFijoResponse } from '@/features/gasto-fijo/interfaces/pago-gasto-fijo.interface';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useResumenPagoGastoFijo } from '@/features/resumen-pago-gasto-fijo/hooks/resumen-pago-gasto-fijo.hook';
import { formatCurrency } from '@/utils/currency';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, ProgressBar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function GastosFijosScreen() {
  const insets = useSafeAreaInsets();
  const [isGastoFijoModalVisible, setIsGastoFijoModalVisible] = useState(false);
  const [isConfirmacionModalVisible, setIsConfirmacionModalVisible] = useState(false);
  const [isMontoPagoModalVisible, setIsMontoPagoModalVisible] = useState(false);
  const [itemParaMarcarPagado, setItemParaMarcarPagado] =
    useState<PagoGastoFijoPorGastoFijoResponse | null>(null);
  const [gastoFijoSeleccionado, setGastoFijoSeleccionado] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const { data: infoIniciales, loading: loadingInfoInicial, fetch: fetchInfoIniciales } =
    useInfoInicialPorUsuario();
  const infoInicialDelMes = infoIniciales?.find(
    (info) => info.mes === currentMonth && info.anio === currentYear
  );
  const infoInicialId = infoInicialDelMes?.id ?? null;

  const {
    pagos,
    infoInicial,
    loading: loadingPagos,
    error: errorPagos,
    fetchPagosPorInfoInicial,
  } = usePagosPorInfoInicial(infoInicialId);

  const { deleteGastoFijo, loading: deleting } = useDeleteGastoFijo();
  const { update: updatePagoGastoFijo, loading: updatingPago } = useUpdatePagoGastoFijo();

  const {
    gastosFijos: misGastosFijos,
    loading: loadingMisGastosFijos,
    fetchMisGastosFijos,
  } = useMisGastosFijos();

  const {
    data: resumenData,
    loading: loadingResumen,
    fetchResumen,
  } = useResumenPagoGastoFijo(infoInicialId);

  const sinInfoInicial = !infoIniciales || infoIniciales.length === 0;

  const cargar = useCallback(() => {
    fetchInfoIniciales();
    if (infoInicialId != null) {
      fetchPagosPorInfoInicial();
      fetchResumen();
    }
    if (sinInfoInicial) {
      fetchMisGastosFijos();
    }
    // Funciones fetch inestables (nueva ref cada render); solo dependemos de los ids/banderas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoInicialId, sinInfoInicial]);

  useEffect(() => {
    fetchInfoIniciales();
    // Solo al montar; fetch no estable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (infoInicialId != null) {
      fetchPagosPorInfoInicial();
      fetchResumen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoInicialId]);

  useEffect(() => {
    if (sinInfoInicial) {
      fetchMisGastosFijos();
    }
    // Solo cuando cambia sinInfoInicial; omitir fetchMisGastosFijos para evitar bucle (ref inestable).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinInfoInicial]);

  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  const handleRefresh = () => {
    cargar();
  };

  const handleEditarGastoFijo = (gastoFijoId: number) => {
    setGastoFijoSeleccionado(gastoFijoId);
    setMenuVisible(null);
    setIsGastoFijoModalVisible(true);
  };

  const handleEliminarGastoFijo = (gastoFijoId: number) => {
    setGastoFijoSeleccionado(gastoFijoId);
    setMenuVisible(null);
    setIsConfirmacionModalVisible(true);
  };

  const getMontoFijo = (item: PagoGastoFijoPorGastoFijoResponse): number => {
    const mf = item.gastoFijo.montoFijo;
    if (mf === null || mf === undefined || mf === '') return 0;
    return typeof mf === 'string' ? parseFloat(mf) || 0 : mf;
  };

  const handleTogglePagado = (item: PagoGastoFijoPorGastoFijoResponse, pagado: boolean) => {
    if (item.pago.id == null) return;
    if (pagado) {
      const montoFijo = getMontoFijo(item);
      const montoPagoActual = item.pago.montoPago ?? 0;
      const esDebitoAutomatico = item.gastoFijo.esDebitoAutomatico && item.gastoFijo.medioPago;

      // Débito automático: usar medio de pago del gasto fijo y monto fijo (sin abrir modal cuando hay monto)
      if (esDebitoAutomatico) {
        const medioPagoId = item.gastoFijo.medioPago!.id;
        const monto = montoFijo > 0 ? montoFijo : montoPagoActual;
        if (monto > 0) {
          ejecutarUpdatePago(item.pago.id, monto, true, medioPagoId);
          return;
        }
        // Débito automático pero monto 0: abrir modal solo para monto (medio ya está)
        setItemParaMarcarPagado(item);
        setIsMontoPagoModalVisible(true);
        return;
      }

      // No es débito automático: siempre abrir modal para monto y medio de pago
      setItemParaMarcarPagado(item);
      setIsMontoPagoModalVisible(true);
    } else {
      ejecutarUpdatePago(item.pago.id, item.pago.montoPago ?? 0, false);
    }
  };

  const ejecutarUpdatePago = async (
    pagoId: number,
    montoPago: number,
    pagado: boolean,
    medioPagoId?: number
  ) => {
    try {
      const body: { pagado: boolean; montoPago: number; medioPagoId?: number } = {
        pagado,
        montoPago: pagado ? Math.max(montoPago, 0.01) : Math.max(montoPago, 0),
      };
      if (pagado && medioPagoId != null && medioPagoId > 0) {
        body.medioPagoId = medioPagoId;
      }
      await updatePagoGastoFijo(pagoId, body);
      Toast.show({
        type: 'success',
        text1: pagado ? 'Marcado como pagado' : 'Marcado como pendiente',
        position: 'top',
        visibilityTime: 2000,
      });
      fetchPagosPorInfoInicial();
      fetchResumen();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error al actualizar el estado',
        position: 'top',
      });
    }
  };

  const handleConfirmMontoPago = async (monto: number, medioPagoId?: number) => {
    if (!itemParaMarcarPagado || itemParaMarcarPagado.pago.id == null) return;
    const id = itemParaMarcarPagado.pago.id;
    const esDebito = itemParaMarcarPagado.gastoFijo.esDebitoAutomatico && itemParaMarcarPagado.gastoFijo.medioPago;
    const medioId = esDebito ? itemParaMarcarPagado.gastoFijo.medioPago!.id : medioPagoId;
    await ejecutarUpdatePago(id, monto, true, medioId);
    setItemParaMarcarPagado(null);
  };

  const confirmarEliminar = async () => {
    if (gastoFijoSeleccionado) {
      try {
        await deleteGastoFijo(gastoFijoSeleccionado);
        Toast.show({
          type: 'success',
          text1: '¡Gasto fijo eliminado!',
          text2: 'El gasto fijo se ha eliminado exitosamente',
          position: 'top',
          visibilityTime: 3000,
        });
        setIsConfirmacionModalVisible(false);
        setGastoFijoSeleccionado(null);
        handleRefresh();
      } catch {
        // El error ya se maneja en el hook
      }
    }
  };

  const totalPagos = pagos.length;
  const totalPages = Math.max(1, Math.ceil(totalPagos / pageSize));
  const pagosPaginated = pagos.slice(page * pageSize, (page + 1) * pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const isLoading = loadingInfoInicial || loadingPagos;

  // Sin info inicial: mostrar mensaje para configurar el mes
  if (!loadingInfoInicial && !infoInicialDelMes && infoIniciales && infoIniciales.length > 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Gastos Fijos
          </Text>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={loadingInfoInicial} onRefresh={handleRefresh} />
          }
        >
          <EmptyStateCard
            icon="calendar-month"
            title="Configura tu mes"
            description={`Registra tu información inicial de ${currentMonth} ${currentYear} para ver y gestionar el estado de tus gastos fijos.`}
          />
          <Button
            mode="contained"
            onPress={() => router.push('/info-inicial-mes' as any)}
            style={styles.configButton}
          >
            Configurar información inicial
          </Button>
        </ScrollView>
      </View>
    );
  }

  // Usuario sin info iniciales (nuevo): puede ver sus gastos fijos (solo lectura de pagos) y se le pide configurar info inicial
  if (!loadingInfoInicial && sinInfoInicial) {
    const loadingLista = loadingMisGastosFijos;
    const tieneGastosFijos = misGastosFijos.length > 0;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Gastos Fijos
          </Text>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={loadingInfoInicial || loadingLista}
              onRefresh={handleRefresh}
            />
          }
        >
          <View style={styles.advisoryCard}>
            <Text variant="titleSmall" style={styles.advisoryTitle}>
              Registra tu información inicial del mes
            </Text>
            <Text variant="bodySmall" style={styles.advisoryText}>
              Para ver el estado de pagos y marcar como pagado cada gasto fijo, configura primero tu información inicial (saldo y medios de pago) del mes actual.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(tabs)' as any)}
              style={styles.configButton}
            >
              Configurar información inicial
            </Button>
          </View>

          {loadingLista ? (
            <LoadingStateBlock message="Cargando tus gastos fijos..." />
          ) : !tieneGastosFijos ? (
            <EmptyStateCard
              icon="repeat"
              title="No hay gastos fijos"
              description="Agrega tus gastos fijos para verlos aquí. Cuando configures la información inicial del mes, podrás marcar si los pagaste."
            />
          ) : (
            <View style={styles.listContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Tus gastos fijos ({misGastosFijos.length})
              </Text>
              <Text variant="bodySmall" style={styles.advisorySubtext}>
                Para poder gestionar los pagos debes configurar tu información inicial del mes.
              </Text>
              {misGastosFijos.map((gastoFijo) => (
                <GastoFijoCard
                  key={gastoFijo.id}
                  gastoFijo={gastoFijo}
                  onEdit={handleEditarGastoFijo}
                  onDelete={handleEliminarGastoFijo}
                  menuVisible={menuVisible === gastoFijo.id}
                  onMenuOpen={() => setMenuVisible(gastoFijo.id)}
                  onMenuClose={() => setMenuVisible(null)}
                  showMenu
                />
              ))}
            </View>
          )}
        </ScrollView>

        <AddFAB onPress={() => setIsGastoFijoModalVisible(true)} />

        <GastoFijoModal
          visible={isGastoFijoModalVisible}
          onDismiss={() => {
            setIsGastoFijoModalVisible(false);
            setGastoFijoSeleccionado(null);
          }}
          onSuccess={() => {
            handleRefresh();
            setGastoFijoSeleccionado(null);
          }}
          gastoFijoId={gastoFijoSeleccionado}
        />

        <ConfirmacionModal
          visible={isConfirmacionModalVisible}
          onDismiss={() => {
            setIsConfirmacionModalVisible(false);
            setGastoFijoSeleccionado(null);
          }}
          onConfirm={confirmarEliminar}
          title="¿Eliminar gasto fijo?"
          message="¿Seguro que quieres eliminar este gasto fijo? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleting}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Gastos Fijos
        </Text>
        {infoInicial && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {infoInicial.mes} {infoInicial.anio}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {loadingPagos ? (
          <LoadingStateBlock message="Cargando gastos fijos..." />
        ) : errorPagos ? (
          <ErrorStateCard message={errorPagos} onRetry={handleRefresh} />
        ) : pagos.length === 0 ? (
          <>
            <EmptyStateCard
              icon="repeat"
              title="No hay gastos fijos"
              description="Registra tus gastos fijos para comenzar a llevar un control de tus pagos recurrentes"
            />
            <Button
              mode="contained"
              onPress={() => setIsGastoFijoModalVisible(true)}
              style={styles.addButton}
            >
              Agregar gasto fijo
            </Button>
          </>
        ) : (
          <>
            <Card style={styles.resumenCard}>
              <Card.Content>
                <View style={styles.resumenHeader}>
                  <MaterialCommunityIcons name="repeat" size={24} color="#6CB4EE" />
                  <Text variant="titleMedium" style={styles.resumenTitle}>
                    Resumen del mes
                  </Text>
                </View>
                {loadingResumen ? (
                  <Text variant="bodyMedium" style={styles.resumenLoading}>
                    Cargando resumen...
                  </Text>
                ) : resumenData ? (
                  <>
                    <Text variant="bodyLarge" style={styles.resumenTexto}>
                      Cuentas pagadas: {resumenData.cantidadGastosPagados} de {resumenData.cantidadGastosTotales}
                    </Text>
                    <View style={styles.resumenMontos}>
                      <Text variant="bodySmall" style={styles.resumenMontoLabel}>
                        Pagado: {formatCurrency(parseFloat(resumenData.montoPagado) || 0)}
                      </Text>
                      <Text variant="bodySmall" style={styles.resumenMontoLabel}>
                        Total: {formatCurrency(parseFloat(resumenData.montoTotal) || 0)}
                      </Text>
                    </View>
                    {resumenData.montoPendiente > 0 && (
                      <Text variant="bodySmall" style={styles.resumenPendiente}>
                        {formatCurrency(resumenData.montoPendiente)} pendiente
                      </Text>
                    )}
                    <View style={styles.resumenProgressContainer}>
                      <ProgressBar
                        progress={(resumenData.porcentajePagado ?? 0) / 100}
                        color="#6CB4EE"
                        style={styles.resumenProgressBar}
                      />
                    </View>
                  </>
                ) : null}
              </Card.Content>
            </Card>
            <View style={styles.listContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Gastos Fijos Mensuales ({totalPagos})
              </Text>
              {pagosPaginated.map((item) => (
                <GastoFijoPagoCard
                  key={item.gastoFijo.id}
                  item={item}
                  onEdit={handleEditarGastoFijo}
                  onDelete={handleEliminarGastoFijo}
                  onTogglePagado={handleTogglePagado}
                  menuVisible={menuVisible === item.gastoFijo.id}
                  onMenuOpen={() => setMenuVisible(item.gastoFijo.id)}
                  onMenuClose={() => setMenuVisible(null)}
                  showMenu
                  pagadoDisabled={updatingPago}
                />
              ))}
            </View>

            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalMovimientos={totalPagos}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
              movimientosLength={pagosPaginated.length}
            />
          </>
        )}
      </ScrollView>

      <AddFAB onPress={() => setIsGastoFijoModalVisible(true)} />

      <GastoFijoModal
        visible={isGastoFijoModalVisible}
        onDismiss={() => {
          setIsGastoFijoModalVisible(false);
          setGastoFijoSeleccionado(null);
        }}
        onSuccess={() => {
          handleRefresh();
          setGastoFijoSeleccionado(null);
        }}
        gastoFijoId={gastoFijoSeleccionado}
      />

      <ConfirmacionModal
        visible={isConfirmacionModalVisible}
        onDismiss={() => {
          setIsConfirmacionModalVisible(false);
          setGastoFijoSeleccionado(null);
        }}
        onConfirm={confirmarEliminar}
        title="¿Eliminar gasto fijo?"
        message="¿Seguro que quieres eliminar este gasto fijo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
      />

      <MontoPagoModal
        visible={isMontoPagoModalVisible}
        onDismiss={() => {
          setIsMontoPagoModalVisible(false);
          setItemParaMarcarPagado(null);
        }}
        onConfirm={handleConfirmMontoPago}
        gastoNombre={itemParaMarcarPagado?.gastoFijo.nombre ?? ''}
        loading={updatingPago}
        requireMedioPago={!itemParaMarcarPagado?.gastoFijo.esDebitoAutomatico}
        medioPagoAsociado={
          itemParaMarcarPagado?.gastoFijo.esDebitoAutomatico && itemParaMarcarPagado?.gastoFijo.medioPago
            ? {
                id: itemParaMarcarPagado.gastoFijo.medioPago!.id,
                nombre: itemParaMarcarPagado.gastoFijo.medioPago!.nombre,
              }
            : undefined
        }
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
    paddingVertical: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    color: '#666666',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  resumenCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6CB4EE',
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  resumenTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  resumenLoading: {
    color: '#666666',
    marginBottom: 8,
  },
  resumenTexto: {
    color: '#333333',
    marginBottom: 4,
  },
  resumenMontos: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  resumenMontoLabel: {
    color: '#666666',
  },
  resumenPendiente: {
    color: '#E74C3C',
    marginBottom: 12,
  },
  resumenProgressContainer: {
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  resumenProgressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#E3F2FD',
  },
  listContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#333333',
  },
  configButton: {
    marginTop: 0,
  },
  addButton: {
    marginTop: 16,
  },
  advisoryCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  advisoryTitle: {
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 8,
  },
  advisoryText: {
    color: '#666666',
    marginBottom: 12,
  },
  advisorySubtext: {
    color: '#666666',
    marginBottom: 12,
  },
});
