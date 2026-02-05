import { TipoMedioPago } from '@/features/medio-pago/interfaces/medio-pago.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

interface ItemMenuMedioPagoProps {
  tipo: TipoMedioPago | 'TODOS';
  label: string;
  icon?: string;
  isActive: boolean;
  onPress: () => void;
}

export function ItemMenuMedioPago({
  tipo,
  label,
  icon,
  isActive,
  onPress,
}: ItemMenuMedioPagoProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={onPress}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={18}
          color={isActive ? '#6CB4EE' : '#666666'}
          style={styles.menuItemIcon}
        />
      )}
      <Text
        variant="bodyMedium"
        style={[styles.menuItemText, isActive && styles.menuItemTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  menuItemActive: {
    borderBottomColor: '#6CB4EE',
    backgroundColor: '#FFFFFF',
  },
  menuItemIcon: {
    marginRight: 6,
  },
  menuItemText: {
    color: '#666666',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
});
