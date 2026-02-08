import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, ProgressBar, Text } from 'react-native-paper';

export interface GastosFijosResumenCardProps {
  pagados: number;
  total: number;
}

export function GastosFijosResumenCard({ pagados, total }: GastosFijosResumenCardProps) {
  const pendientes = total - pagados;
  const progreso = total > 0 ? pagados / total : 0;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="repeat" size={24} color="#6CB4EE" />
          <Text variant="titleMedium" style={styles.title}>
            Gastos fijos del mes
          </Text>
        </View>
        <Text variant="bodyLarge" style={styles.texto}>
          {pagados} de {total} pagados
        </Text>
        {pendientes > 0 && (
          <Text variant="bodySmall" style={styles.pendientes}>
            {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
          </Text>
        )}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progreso}
            color="#6CB4EE"
            style={styles.progressBar}
          />
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/gastos-fijos' as any)}
          style={styles.verDetalleButton}
          activeOpacity={0.7}
        >
          <Text variant="bodyMedium" style={styles.verDetalleText}>
            Ver detalle
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6CB4EE" />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6CB4EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontWeight: '600',
    color: '#333333',
  },
  texto: {
    color: '#333333',
    marginBottom: 4,
  },
  pendientes: {
    color: '#E74C3C',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#E3F2FD',
  },
  verDetalleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    gap: 4,
  },
  verDetalleText: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
});
