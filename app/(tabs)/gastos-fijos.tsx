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
import { usePagosGastoFijoPorMes, useUpdatePagoGastoFijo } from '@/features/gasto-fijo/hooks/pago-gasto-fijo.hook';
import { PagoGastoFijoPorGastoFijoResponse } from '@/features/gasto-fijo/interfaces/pago-gasto-fijo.interface';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
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

  const {
    pagos,
    loading: loadingPagos,
    error: errorPagos,
    fetchPagosPorMes,
  } = usePagosGastoFijoPorMes(currentYear, currentMonth);

  const { deleteGastoFijo, loading: deleting } = useDeleteGastoFijo();
  const { update: updatePagoGastoFijo, loading: updatingPago } = useUpdatePagoGastoFijo();

  const {
    gastosFijos: misGastosFijos,
    loading: loadingMisGastosFijos,
    fetchMisGastosFijos,
  } = useMisGastosFijos();

  const cargar = useCallback(() => {
    fetchPagosPorMes();
    fetchMisGastosFijos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const gf = item.gastoFijo;
    const val = gf.montoEstimado ?? gf.montoFijo;
    if (val === null || val === undefined || val === '') return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : Number(val);
  };

  const getMontoPago = (item: PagoGastoFijoPorGastoFijoResponse): number => {
    const m = item.pago.monto ?? item.pago.montoPago;
    return m ?? 0;
  };

  const handleTogglePagado = (item: PagoGastoFijoPorGastoFijoResponse, pagado: boolean) => {
    if (item.pago.id == null) return;
    if (pagado) {
      const montoFijo = getMontoFijo(item);
      const montoPagoActual = getMontoPago(item);
      const esDebitoAutomatico = item.gastoFijo.esDebitoAutomatico;

      // Débito automático con monto conocido: marcar sin abrir modal
      if (esDebitoAutomatico) {
        const monto = montoFijo > 0 ? montoFijo : montoPagoActual;
        if (monto > 0) {
          ejecutarUpdatePago(item.pago.id, monto, true);
          return;
        }
        // Débito automático pero monto 0: abrir modal solo para monto
        setItemParaMarcarPagado(item);
        setIsMontoPagoModalVisible(true);
        return;
      }

      // Siempre abrir modal para ingresar monto al marcar como pagado
      setItemParaMarcarPagado(item);
      setIsMontoPagoModalVisible(true);
    } else {
      ejecutarUpdatePago(item.pago.id, getMontoPago(item), false);
    }
  };

  const ejecutarUpdatePago = async (pagoId: number, monto: number, pagado: boolean) => {
    try {
      const body = {
        monto: pagado ? Math.max(monto, 0.01) : Math.max(monto, 0),
        pagado,
      };
      await updatePagoGastoFijo(pagoId, body);
      Toast.show({
        type: 'success',
        text1: pagado ? 'Marcado como pagado' : 'Marcado como pendiente',
        position: 'top',
        visibilityTime: 2000,
      });
      fetchPagosPorMes();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error al actualizar el estado',
        position: 'top',
      });
    }
  };

  const handleConfirmMontoPago = async (monto: number) => {
    if (!itemParaMarcarPagado || itemParaMarcarPagado.pago.id == null) return;
    const id = itemParaMarcarPagado.pago.id;
    await ejecutarUpdatePago(id, monto, true);
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

  const isLoading = loadingPagos;

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
