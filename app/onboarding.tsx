import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { MiGuitaBrand } from '@/components/miguita-brand';

const { width } = Dimensions.get('window');

const primary = '#4DA6FF';
const primaryLight = '#E6F2FF';
const textColor = '#1A1A1A';

const steps = [
  {
    id: 1,
    title: 'Organizá tu plata de forma simple',
    description: 'MiGuita te ayuda a ver todo tu dinero en un solo lugar, sin complicarte la vida.',
  },
  {
    id: 2,
    title: 'Registrá tus ingresos y gastos',
    description: 'Anotá lo que entra y lo que sale para entender a dónde se va tu guita.',
  },
  {
    id: 3,
    title: 'Definí tus presupuestos',
    description: 'Marcá cuánto querés gastar en cada categoría y evitá sorpresas a fin de mes.',
  },
  {
    id: 4,
    title: 'Empezá a controlar tu guita 💙',
    description: 'Te mostramos tu balance, alertas y tips para que vayas tranquilo mes a mes.',
  },
];

export default function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.push('/register' as any);
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleSkip = () => {
    router.push('/login' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandWrapper}>
        <MiGuitaBrand />
      </View>

      <View style={styles.card}>
        <Text variant="titleMedium" style={styles.badge}>
          Paso {stepIndex + 1} de {steps.length}
        </Text>
        <Text variant="headlineSmall" style={styles.title}>
          {step.title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {step.description}
        </Text>

        <View style={styles.dotsRow}>
          {steps.map((s, idx) => (
            <View
              key={s.id}
              style={[styles.dot, idx === stepIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.buttonsRow}>
          <Button
            mode="outlined"
            onPress={handleSkip}
            style={styles.secondaryButton}
            labelStyle={styles.secondaryButtonLabel}
          >
            Ya tengo cuenta
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.primaryButton}
            contentStyle={styles.primaryButtonContent}
            labelStyle={styles.primaryButtonLabel}
            buttonColor={primary}
          >
            {isLast ? 'Crear cuenta' : 'Empezar'}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandWrapper: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  card: {
    width: width - 48,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: primaryLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    color: primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    color: textColor,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: '#555555',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B0C4DE',
  },
  dotActive: {
    width: 18,
    backgroundColor: primary,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderColor: primary,
  },
  secondaryButtonLabel: {
    color: primary,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 999,
  },
  primaryButtonContent: {
    paddingVertical: 6,
  },
  primaryButtonLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

