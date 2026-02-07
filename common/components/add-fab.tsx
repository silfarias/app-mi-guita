import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export interface AddFABProps {
  onPress: () => void;
  icon?: string;
  color?: string;
  backgroundColor?: string;
}

export function AddFAB({
  onPress,
  icon = 'plus',
  color = '#FFFFFF',
  backgroundColor = '#6CB4EE',
}: AddFABProps) {
  const insets = useSafeAreaInsets();

  return (
    <FAB
      icon={icon as any}
      style={[styles.fab, { bottom: insets.bottom + 16, backgroundColor }]}
      onPress={onPress}
      color={color}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
  },
});
