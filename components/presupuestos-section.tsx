import { DashboardPresupuestoItem } from '@/features/dashboard/interfaces/dashboard.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, ProgressBar, Text } from 'react-native-paper';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

export interface PresupuestosSectionProps {
  presupuestos: DashboardPresupuestoItem[];
}

export function PresupuestosSection({ presupuestos }: PresupuestosSectionProps) {
  if (!presupuestos?.length) return null;

  const getEstadoColor = (estado: string) => {
    if (estado === 'EXCEDIDO') return '#E74C3C';
    if (estado === 'ALERTA') return '#F39C12';
    return '#2ECC71';
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#F39C12" />
          <Text variant="titleMedium" style={styles.title}>
            Presupuestos
          </Text>
        </View>
        {presupuestos.map((p, index) => {
          const progress = Math.min(1, p.presupuesto > 0 ? p.gastado / p.presupuesto : 0);
          const color = getEstadoColor(p.estado);
          return (
            <View key={index} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text variant="bodyLarge" style={styles.categoria}>
                  {p.categoria}
                </Text>
                <Text variant="bodySmall" style={[styles.porcentaje, { color }]}>
                  {Math.round(p.porcentaje)}%
                </Text>
              </View>
              <ProgressBar
                progress={progress}
                color={color}
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={styles.montos}>
                {formatCurrency(p.gastado)} / {formatCurrency(p.presupuesto)}
              </Text>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    color: '#333333',
  },
  item: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoria: {
    fontWeight: '600',
    color: '#333333',
  },
  porcentaje: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  montos: {
    marginTop: 4,
    color: '#666666',
  },
});
