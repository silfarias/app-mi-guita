import { StyleSheet } from 'react-native';
import { Card, DataTable } from 'react-native-paper';

interface PaginationBarProps {
  page: number; // 0-indexed
  totalPages: number;
  totalMovimientos: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  movimientosLength?: number; // Longitud del array de movimientos devueltos
}

export function PaginationBar({
  page,
  totalPages,
  totalMovimientos,
  pageSize,
  onPageChange,
  onPageSizeChange,
  movimientosLength = 0,
}: PaginationBarProps) {
  // Mostrar paginación solo si hay más movimientos que el tamaño de página
  const shouldShowPagination = totalMovimientos > pageSize || movimientosLength > pageSize;

  if (!shouldShowPagination) {
    return null;
  }

  return (
    <Card style={styles.paginationCard}>
      <DataTable>
        <DataTable.Pagination
          page={page}
          numberOfPages={totalPages}
          onPageChange={onPageChange}
          label={`${page * pageSize + 1}-${Math.min((page + 1) * pageSize, totalMovimientos)} de ${totalMovimientos}`}
          showFastPaginationControls
          numberOfItemsPerPageList={[5, 10, 20, 50]}
          numberOfItemsPerPage={pageSize}
          onItemsPerPageChange={onPageSizeChange}
          selectPageDropdownLabel={'Registros'}
          style={styles.paginationStyle}
        />
      </DataTable>
    </Card>
  );
}

const styles = StyleSheet.create({
  paginationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  paginationStyle: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
