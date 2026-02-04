import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';


export function MiGuitaBrand() {
  return (
    <View style={styles.brandContainer}>
      <Text variant="displaySmall" style={styles.brandName}>
      💰 MiGuita
      </Text>
      <Text variant="bodyMedium" style={styles.brandTagline}>
        Tu dinero, bajo control
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  brandName: {
    fontWeight: 'bold',
    color: '#6CB4EE', // Celeste argentino
    marginBottom: 8,
    textAlign: 'center',
  },
  brandTagline: {
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
