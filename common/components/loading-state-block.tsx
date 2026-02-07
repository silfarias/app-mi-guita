import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface LoadingStateBlockProps {
  message?: string;
  color?: string;
  style?: object;
}

export function LoadingStateBlock({
  message = 'Cargando...',
  color = '#6CB4EE',
  style,
}: LoadingStateBlockProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={color} />
      <Text variant="bodyMedium" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    color: '#666666',
  },
});
