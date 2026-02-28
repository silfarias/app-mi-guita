import { ResumenPorCategoria } from '@/features/reporte/interfaces/reporte.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface Top5CategoriasProps {
  categorias: ResumenPorCategoria[];
}

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
};

export function Top5Categorias({ categorias }: Top5CategoriasProps) {
  if (!categorias || categorias.length === 0) return null;

  return (
    <Card style={styles.categoriasCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="tag-multiple" size={24} color="#6CB4EE" />
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Top 5 Categorías
          </Text>
        </View>
        {categorias.map((item) => (
          <View key={item.categoria.id} style={styles.categoriaItem}>
            <View style={styles.categoriaLeft}>
              <View
                style={[
                  styles.categoriaIconContainer,
                  { backgroundColor: `${item.categoria.color}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.categoria.icono as any}
                  size={20}
                  color={item.categoria.color}
                />
              </View>
              <View style={styles.categoriaInfo}>
                <Text variant="bodyMedium" style={styles.categoriaNombre}>
                  {item.categoria.nombre}
                </Text>
                <Text variant="bodySmall" style={styles.categoriaMeta}>
                  {item.cantidadMovimientos} movimientos • {item.porcentaje.toFixed(1)}%
                </Text>
              </View>
            </View>
            <Text variant="bodyLarge" style={styles.categoriaMonto}>
              {formatCurrency(item.total)}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  categoriasCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoriaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoriaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriaInfo: {
    flex: 1,
  },
  categoriaNombre: {
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  categoriaMeta: {
    color: '#666666',
  },
  categoriaMonto: {
    fontWeight: '600',
    color: '#333333',
  },
});
