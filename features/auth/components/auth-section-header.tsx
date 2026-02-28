import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export interface AuthSectionHeaderProps {
  title: string;
  subtitle: string;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666666',
    textAlign: 'center',
  },
});

export function AuthSectionHeader({ title, subtitle }: AuthSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
}
