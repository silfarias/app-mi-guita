import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';

import { MiGuitaBrand } from '@/components/miguita-brand';
import { useCuentaOnboarding } from '@/features/cuenta/hooks/cuenta-onboarding.hook';

const primary = '#4DA6FF';
const primaryLight = '#E6F2FF';

type LocalCuenta = {
  id: number;
  nombre: string;
  tipo: string;
  saldoInicial: string;
};

const TIPOS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'BANCO', label: 'Banco' },
  { value: 'BILLETERA', label: 'Billetera virtual' },
];

export default function SetupCuentasScreen() {
  const [cuentas, setCuentas] = useState<LocalCuenta[]>([
    { id: 1, nombre: 'Efectivo', tipo: 'EFECTIVO', saldoInicial: '' },
  ]);
  const { submitCuentas, loading, error, completed } = useCuentaOnboarding();

  const handleChange = (id: number, field: keyof LocalCuenta, value: string) => {
    setCuentas((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleAddCuenta = () => {
    const nextId = cuentas.length ? Math.max(...cuentas.map((c) => c.id)) + 1 : 1;
    setCuentas((prev) => [
      ...prev,
      { id: nextId, nombre: '', tipo: 'EFECTIVO', saldoInicial: '' },
    ]);
  };

  const handleRemoveCuenta = (id: number) => {
    if (cuentas.length === 1) return;
    setCuentas((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = async () => {
    await submitCuentas(
      cuentas.map((c) => ({
        nombre: c.nombre.trim(),
        tipo: c.tipo,
        saldoInicial: Number(c.saldoInicial) || 0,
      }))
    );
    if (!error && !loading) {
      router.replace('/(tabs)' as any);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandWrapper}>
          <MiGuitaBrand />
        </View>

        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.badge}>
            Paso 1 de 3
          </Text>
          <Text variant="headlineSmall" style={styles.title}>
            ¿Dónde tenés tu plata?
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Cargá tus cuentas principales para que MiGuita pueda calcular tu saldo inicial.
          </Text>

          {cuentas.map((cuenta, index) => (
            <View key={cuenta.id} style={styles.cuentaRow}>
              <Text style={styles.cuentaLabel}>
                Cuenta {index + 1}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre (Efectivo, Banco, MercadoPago...)"
                value={cuenta.nombre}
                onChangeText={(text) => handleChange(cuenta.id, 'nombre', text)}
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="Tipo (EFECTIVO, BANCO, BILLETERA)"
                value={cuenta.tipo}
                onChangeText={(text) => handleChange(cuenta.id, 'tipo', text)}
                editable={!loading}
                autoCapitalize="characters"
              />
              <TextInput
                style={styles.input}
                placeholder="Saldo inicial"
                keyboardType="numeric"
                value={cuenta.saldoInicial}
                onChangeText={(text) => handleChange(cuenta.id, 'saldoInicial', text)}
                editable={!loading}
              />
              {cuentas.length > 1 && (
                <Button
                  mode="text"
                  onPress={() => handleRemoveCuenta(cuenta.id)}
                  disabled={loading}
                  textColor="#E74C3C"
                >
                  Quitar
                </Button>
              )}
            </View>
          ))}

          <Button
            mode="outlined"
            onPress={handleAddCuenta}
            style={styles.addButton}
            textColor={primary}
            disabled={loading}
          >
            Agregar otra cuenta
          </Button>

          {error && (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.primaryButton}
            contentStyle={styles.primaryButtonContent}
            labelStyle={styles.primaryButtonLabel}
            buttonColor={primary}
          >
            Guardar y seguir
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 16,
  },
  cuentaRow: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cuentaLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    marginTop: 4,
    marginBottom: 8,
    borderColor: primary,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 999,
  },
  primaryButtonContent: {
    paddingVertical: 8,
  },
  primaryButtonLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

