import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { MiGuitaBrand } from '@/components/miguita-brand';

const primary = '#4DA6FF';
const primaryLight = '#E6F2FF';

export default function SetupPresupuestosScreen() {
  const handleSkip = () => {
    router.replace('/setup-listo' as any);
  };

  const handleDefinir = () => {
    // Por ahora llevamos directo a listo; más adelante se puede agregar formulario de presupuestos
    router.replace('/setup-listo' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandWrapper}>
        <MiGuitaBrand />
      </View>
      <View style={styles.card}>
        <Text variant="titleMedium" style={styles.badge}>
          Paso 3 de 4
        </Text>
        <Text variant="headlineSmall" style={styles.title}>
          Definí cuánto querés gastar
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Podés definir presupuestos por categoría para no pasarte. Es opcional, podés hacerlo más adelante.
        </Text>

        <Button
          mode="contained"
          onPress={handleDefinir}
          style={styles.primaryButton}
          contentStyle={styles.primaryButtonContent}
          labelStyle={styles.primaryButtonLabel}
          buttonColor={primary}
        >
          Definir presupuestos
        </Button>

        <Button mode="text" onPress={handleSkip} style={styles.skipButton} textColor="#666666">
          Saltear por ahora
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
  },
  badge: {
    color: primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#555555',
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 999,
    marginBottom: 12,
  },
  primaryButtonContent: {
    paddingVertical: 8,
  },
  primaryButtonLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    marginTop: 4,
  },
});
