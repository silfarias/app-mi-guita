import { ConfirmacionModal } from '@/components/confirmacion-modal';
import { PaginationBar } from '@/components/pagination-bar';
import {
  AddFAB,
  EmptyStateCard,
  ErrorStateCard,
  LoadingStateBlock,
} from '@/common/components';
import { GastoFijoModal } from '@/features/gasto-fijo/components/gasto-fijo-modal';
import { GastoFijoCard } from '@/features/gasto-fijo/components/gasto-fijo-card';
import {
  useDeleteGastoFijo,
  useMisGastosFijos,
} from '@/features/gasto-fijo/hooks/gasto-fijo.hook';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function GastosFijosScreen() {
  const insets = useSafeAreaInsets();
  const [isGastoFijoModalVisible, setIsGastoFijoModalVisible] = useState(false);
  const [isConfirmacionModalVisible, setIsConfirmacionModalVisible] = useState(false);
  const [gastoFijoSeleccionado, setGastoFijoSeleccionado] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { gastosFijos, loading, error, fetchMisGastosFijos } = useMisGastosFijos();
  const { deleteGastoFijo, loading: deleting } = useDeleteGastoFijo();

  useEffect(() => {
    fetchMisGastosFijos();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  const handleRefresh = () => {
    fetchMisGastosFijos();
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

  const totalGastosFijos = gastosFijos.length;
  const totalPages = Math.max(1, Math.ceil(totalGastosFijos / pageSize));
  const gastosFijosPaginated = gastosFijos.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Gastos Fijos
        </Text>
      </View>

      {/* Contenido principal */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
      >
        {loading ? (
          <LoadingStateBlock message="Cargando gastos fijos..." />
        ) : error ? (
          <ErrorStateCard message={error} onRetry={handleRefresh} />
        ) : gastosFijos.length === 0 ? (
          <EmptyStateCard
            icon="repeat"
            title="No hay gastos fijos"
            description="Registra tus gastos fijos para comenzar a llevar un control de tus pagos recurrentes"
          />
        ) : (
          <>
            <View style={styles.listContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Gastos Fijos ({totalGastosFijos})
              </Text>
              {gastosFijosPaginated.map((gastoFijo) => (
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

            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalMovimientos={totalGastosFijos}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
              movimientosLength={gastosFijosPaginated.length}
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
});
