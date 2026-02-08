import {
  AddFAB,
  EmptyStateCard,
  ErrorStateCard,
  LoadingStateBlock,
} from '@/common/components';
import { PaginationBar } from '@/components/pagination-bar';
import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { GastoFijoModal } from '@/features/gasto-fijo/components/gasto-fijo-modal';
import { GastoFijoPagoCard } from '@/features/gasto-fijo/components/gasto-fijo-pago-card';
import { MontoPagoModal } from '@/features/gasto-fijo/components/monto-pago-modal';
import { PagoGastoFijoPorGastoFijoResponse } from '@/features/gasto-fijo/interfaces/pago-gasto-fijo.interface';
import {
  usePagosPorInfoInicial,
  useUpdatePagoGastoFijo,
} from '@/features/gasto-fijo/hooks/pago-gasto-fijo.hook';
import { useDeleteGastoFijo } from '@/features/gasto-fijo/hooks/gasto-fijo.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
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

  const cargar = useCallback(() => {
    fetchInfoIniciales();
    if (infoInicialId != null) {
      fetchPagosPorInfoInicial();
    }
  }, [infoInicialId, fetchInfoIniciales, fetchPagosPorInfoInicial]);

  useEffect(() => {
    fetchInfoIniciales();
  }, []);

  useEffect(() => {
    if (infoInicialId != null) {
      fetchPagosPorInfoInicial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoInicialId]);

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
      if (montoFijo <= 0) {
        setItemParaMarcarPagado(item);
        setIsMontoPagoModalVisible(true);
        return;
      }
      ejecutarUpdatePago(item.pago.id, montoFijo, true);
    } else {
      ejecutarUpdatePago(item.pago.id, item.pago.montoPago, false);
    }
  };

  const ejecutarUpdatePago = async (pagoId: number, montoPago: number, pagado: boolean) => {
    try {
      await updatePagoGastoFijo(pagoId, { montoPago, pagado });
      Toast.show({
        type: 'success',
        text1: pagado ? 'Marcado como pagado' : 'Marcado como pendiente',
        position: 'top',
        visibilityTime: 2000,
      });
      fetchPagosPorInfoInicial();
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
    await ejecutarUpdatePago(itemParaMarcarPagado.pago.id, monto, true);
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

  // Usuario sin info iniciales (nuevo)
  if (!loadingInfoInicial && (!infoIniciales || infoIniciales.length === 0)) {
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
            icon="repeat"
            title="No hay gastos fijos"
            description="Primero configura tu información inicial del mes desde el menú. Luego podrás agregar gastos fijos y marcar si los pagaste."
          />
        </ScrollView>
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
  listContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#333333',
  },
  configButton: {
    marginTop: 16,
  },
  addButton: {
    marginTop: 16,
  },
});
