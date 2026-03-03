import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MiGuitaBrand } from '@/components/miguita-brand';

const primary = '#4DA6FF';
const primaryLight = '#E6F2FF';

export default function SetupListoScreen() {
  const handleEmpezar = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandWrapper}>
        <MiGuitaBrand />
      </View>
      <View style={styles.card}>
        <Text variant="titleMedium" style={styles.badge}>
          Paso 4 de 4
        </Text>
        <MaterialCommunityIcons name="check-circle" size={64} color={primary} style={styles.icon} />
        <Text variant="headlineSmall" style={styles.title}>
          Ya podés empezar 🚀
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Tu cuenta está lista. Desde el inicio vas a ver tu balance, movimientos y gastos.
        </Text>

        <Button
          mode="contained"
          onPress={handleEmpezar}
          style={styles.primaryButton}
          contentStyle={styles.primaryButtonContent}
          labelStyle={styles.primaryButtonLabel}
          buttonColor={primary}
        >
          Ir al inicio
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  brandWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: primaryLight,
    alignItems: 'center',
  },
  badge: {
    color: primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#555555',
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 999,
    width: '100%',
  },
  primaryButtonContent: {
    paddingVertical: 8,
  },
  primaryButtonLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
