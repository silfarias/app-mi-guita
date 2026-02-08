import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { AuthFooterLink } from '@/components/auth-footer-link';
import { AuthSectionHeader } from '@/components/auth-section-header';
import { MiGuitaBrand } from '@/components/miguita-brand';
import { FormErrorBlock, TextInputFormField } from '@/common/components';
import { useLoginForm } from '@/features/auth/hooks/auth.hook';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    onSubmit,
    loading,
    error,
  } = useLoginForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <MiGuitaBrand />
          <AuthSectionHeader
            title="Iniciar Sesión"
            subtitle="Bienvenido de vuelta a MiGuita"
          />

          <TextInputFormField
            control={control}
            name="nombreUsuario"
            rules={{
              required: 'El nombre de usuario es requerido',
            }}
            label="Nombre de Usuario"
            placeholder="tu_nombre_usuario"
            disabled={loading}
            keyboardType="default"
            autoCapitalize="none"
            autoComplete="username"
          />

          <TextInputFormField
            control={control}
            name="contrasena"
            rules={{ required: 'La contraseña es requerida' }}
            label="Contraseña"
            placeholder="••••••••"
            disabled={loading}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {error && <FormErrorBlock message={error} />}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            loading={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <AuthFooterLink
            promptText="¿No tienes una cuenta?"
            linkText="Crea una aquí"
            onPress={() => router.push('/register' as any)}
          />
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  button: {
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#6CB4EE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
