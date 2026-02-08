import {
  EmptyStateCard,
} from '@/common/components';
import { MedioPagoElemento } from '@/features/medio-pago/interfaces/medio-pago.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { InfoInicialMedioPagoCard } from './info-inicial-medio-pago-card';

export interface InfoInicialMediosPagoListProps {
  mediosPago: MedioPagoElemento[];
  montoTotal: number;
}

export function InfoInicialMediosPagoList({ mediosPago, montoTotal }: InfoInicialMediosPagoListProps) {
  if (!mediosPago || mediosPago.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Distribución por Medio de Pago
        </Text>
        <EmptyStateCard
          icon="wallet-outline"
          iconColor="#CCCCCC"
          iconSize={48}
          title="No hay medios de pago registrados"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Distribución por Medio de Pago
      </Text>
      {mediosPago.map((medio, index) => (
        <InfoInicialMedioPagoCard
          key={medio.id || index}
          medio={medio}
          montoTotal={montoTotal}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
});
