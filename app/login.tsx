import { router } from 'expo-router';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
} from 'react-native-paper';

import { MiGuitaBrand } from '@/components/miguita-brand';
import { useLoginForm } from '@/features/auth/hooks/auth.hook';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    errors,
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

          <View style={styles.titleContainer}>
            <Text variant="headlineLarge" style={styles.title}>
              Iniciar Sesión
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Bienvenido de vuelta a MiGuita
            </Text>
          </View>

          <Controller
            control={control}
            name="nombreUsuario"
            rules={{
              required: 'El nombre de usuario es obligatorio',
              minLength: {
                value: 3,
                message: 'El nombre de usuario debe tener al menos 3 caracteres',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Nombre de Usuario"
                placeholder="tu_nombre_usuario"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                keyboardType="default"
                autoCapitalize="none"
                autoComplete="username"
                disabled={loading}
                error={!!errors.nombreUsuario}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
              />
            )}
          />
          {errors.nombreUsuario && (
            <Text variant="bodySmall" style={styles.fieldError}>
              {errors.nombreUsuario.message}
            </Text>
          )}

          <Controller
            control={control}
            name="contrasena"
            rules={{ required: 'La contraseña es obligatoria' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Contraseña"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                disabled={loading}
                error={!!errors.contrasena}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
              />
            )}
          />
          {errors.contrasena && (
            <Text variant="bodySmall" style={styles.fieldError}>
              {errors.contrasena.message}
            </Text>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

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

          <View style={styles.registerContainer}>
            <Text variant="bodyMedium" style={styles.registerText}>
              ¿No tienes una cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/register' as any)}>
              <Text variant="bodyMedium" style={styles.registerLink}>
                Crea una aquí
              </Text>
            </TouchableOpacity>
          </View>
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
  titleContainer: {
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
  input: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  inputContent: {
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  button: {
    marginTop: 8,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#666666',
  },
  registerLink: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
  debugText: {
    color: '#999999',
    fontSize: 10,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  fieldError: {
    color: '#C62828',
    marginTop: -12,
    marginBottom: 12,
  },
});
