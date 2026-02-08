import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export interface SettingsRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  iconColor?: string;
  chevronColor?: string;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  label: {
    color: '#333333',
    fontWeight: '500',
  },
});

export function SettingsRow({
  icon,
  label,
  onPress,
  iconColor = '#6CB4EE',
  chevronColor = '#999999',
}: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <MaterialCommunityIcons name={icon as any} size={24} color={iconColor} />
        <Text variant="bodyLarge" style={styles.label}>
          {label}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={chevronColor} />
    </TouchableOpacity>
  );
}
