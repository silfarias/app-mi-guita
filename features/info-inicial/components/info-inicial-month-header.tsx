import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface InfoInicialMonthHeaderProps {
  mes: string;
  anio: number;
  onEdit: () => void;
}

export function InfoInicialMonthHeader({ mes, anio, onEdit }: InfoInicialMonthHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="calendar-month" size={24} color="#6CB4EE" />
        <View style={styles.textContainer}>
          <Text variant="titleLarge" style={styles.monthText}>
            {mes}
          </Text>
          <Text variant="bodyMedium" style={styles.yearText}>
            {anio}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <MaterialCommunityIcons name="pencil" size={20} color="#6CB4EE" />
        <Text variant="bodyMedium" style={styles.editButtonText}>
          Editar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  monthText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  yearText: {
    color: '#666666',
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  editButtonText: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
});
