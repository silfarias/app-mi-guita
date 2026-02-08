import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export interface AuthFooterLinkProps {
  promptText: string;
  linkText: string;
  onPress: () => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  promptText: {
    color: '#666666',
  },
  linkText: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
});

export function AuthFooterLink({ promptText, linkText, onPress }: AuthFooterLinkProps) {
  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.promptText}>
        {promptText}{' '}
      </Text>
      <TouchableOpacity onPress={onPress}>
        <Text variant="bodyMedium" style={styles.linkText}>
          {linkText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
