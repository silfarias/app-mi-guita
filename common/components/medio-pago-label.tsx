import { getMedioPagoIcon } from '@/utils/medio-pago-icon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface MedioPagoLabelProps {
  tipo: string;
  nombre: string;
  iconSize?: number;
  iconColor?: string;
}

export function MedioPagoLabel({
  tipo,
  nombre,
  iconSize = 16,
  iconColor = '#666666',
}: MedioPagoLabelProps) {
  const iconName = getMedioPagoIcon(tipo);
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
      <Text variant="bodySmall" style={styles.text}>
        {nombre}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {},
  text: {
    color: '#666666',
    fontSize: 12,
  },
});
