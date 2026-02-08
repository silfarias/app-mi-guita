import {
  EmptyStateCard,
  ErrorStateCard,
  LoadingStateBlock,
} from '@/common/components';
import { PaginationBar } from '@/components/pagination-bar';
import { MovimientoCard } from '@/features/movimiento/components/movimiento-card';
import { MovimientoListItem } from '@/features/movimiento/interfaces/movimiento.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface MovimientosHistoricoListProps {
  movimientos: MovimientoListItem[];
  totalMovimientos: number;
  totalPages: number;
  page: number;
  pageSize: number;
  mesSeleccionado: string;
  anioSeleccionado: number;
  movimientosExpandidos: Set<number>;
  loading?: boolean;
  error?: string;
  onToggleExpand: (id: number) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry?: () => void;
}

export function MovimientosHistoricoList({
  movimientos,
  totalMovimientos,
  totalPages,
  page,
  pageSize,
  mesSeleccionado,
  anioSeleccionado,
  movimientosExpandidos,
  loading = false,
  error,
  onToggleExpand,
  onPageChange,
  onPageSizeChange,
  onRetry,
}: MovimientosHistoricoListProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Movimientos
        </Text>
        <LoadingStateBlock message="Cargando movimientos..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Movimientos
        </Text>
        <ErrorStateCard message={error} onRetry={onRetry} />
      </View>
    );
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Movimientos
        </Text>
        <EmptyStateCard
          icon="inbox"
          iconColor="#CCCCCC"
          iconSize={48}
          title="No hay movimientos"
          description={`No se encontraron movimientos para ${mesSeleccionado} ${anioSeleccionado}`}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#6CB4EE" />
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Movimientos ({totalMovimientos})
        </Text>
      </View>
      {movimientos.map((movimiento) => {
        const isExpanded = movimientosExpandidos.has(movimiento.id);
        return (
          <MovimientoCard
            key={movimiento.id}
            movimiento={movimiento}
            isExpanded={isExpanded}
            onPress={() => onToggleExpand(movimiento.id)}
            showMenu={false}
          />
        );
      })}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalMovimientos={totalMovimientos}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        movimientosLength={movimientos.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
  },
});
