import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Alert,
  Image,
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
import { useSignupForm } from '@/features/auth/hooks/auth.hook';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    control,
    handleSubmit,
    errors,
    onSubmit,
    loading,
    error,
    password,
  } = useSignupForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo/Bienvenida MiGuita */}
          <MiGuitaBrand />

          {/* Título */}
          <View style={styles.titleContainer}>
            <Text variant="headlineLarge" style={styles.title}>
              Crear Cuenta
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Únete a MiGuita y comienza a gestionar tu dinero
            </Text>
          </View>

          {/* Selector de Foto de Perfil */}
          <Controller
            control={control}
            name="fotoPerfil"
            render={({ field: { onChange, value } }) => {
              const pickImage = async () => {
                // Solicitar permisos
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert(
                    'Permisos necesarios',
                    'Necesitamos acceso a tu galería para seleccionar una foto de perfil.'
                  );
                  return;
                }

                // Abrir selector de imagen
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  const asset = result.assets[0];
                  // Formato para React Native (objeto con uri, type, name)
                  onChange({
                    uri: asset.uri,
                    type: 'image/jpeg',
                    name: 'foto-perfil.jpg',
                  } as any);
                }
              };

              const removeImage = () => {
                onChange(undefined);
              };

              return (
                <View style={styles.photoContainer}>
                  <Text variant="bodyMedium" style={styles.photoLabel}>
                    Foto de Perfil (Opcional)
                  </Text>
                  <View style={styles.photoSelectorContainer}>
                    {value ? (
                      <>
                        <View style={styles.photoPreview}>
                          <Image 
                            source={{ uri: (value as any)?.uri || String(value) }} 
                            style={styles.photoImage} 
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={removeImage}
                          disabled={loading}
                        >
                          <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.photoPlaceholder}
                        onPress={pickImage}
                        disabled={loading}
                      >
                        <Text style={styles.photoPlaceholderIcon}>📷</Text>
                        <Text variant="bodySmall" style={styles.photoPlaceholderText}>
                          Toca para agregar foto
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />

          {/* Campos en dos columnas para nombre y apellido */}
          <View style={styles.row}>
            {/* Campo de Nombre */}
            <View style={styles.halfInput}>
              <Controller
                control={control}
                name="nombre"
                rules={{
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Nombre"
                    placeholder="Juan"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    disabled={loading}
                    error={!!errors.nombre}
                    style={styles.input}
                    contentStyle={styles.inputContent}
                    outlineStyle={styles.inputOutline}
                  />
                )}
              />
              {errors.nombre && (
                <Text variant="bodySmall" style={styles.fieldError}>
                  {errors.nombre.message}
                </Text>
              )}
            </View>

            {/* Campo de Apellido */}
            <View style={styles.halfInput}>
              <Controller
                control={control}
                name="apellido"
                rules={{
                  required: 'El apellido es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El apellido debe tener al menos 2 caracteres',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Apellido"
                    placeholder="Pérez"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    disabled={loading}
                    error={!!errors.apellido}
                    style={styles.input}
                    contentStyle={styles.inputContent}
                    outlineStyle={styles.inputOutline}
                  />
                )}
              />
              {errors.apellido && (
                <Text variant="bodySmall" style={styles.fieldError}>
                  {errors.apellido.message}
                </Text>
              )}
            </View>
          </View>

          {/* Campo de Nombre de Usuario */}
          <Controller
            control={control}
            name="nombreUsuario"
            rules={{
              required: 'El nombre de usuario es obligatorio',
              minLength: {
                value: 3,
                message: 'El nombre de usuario debe tener al menos 3 caracteres',
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'El nombre de usuario solo puede contener letras, números y guiones bajos',
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

          {/* Campo de Email */}
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'El email es obligatorio',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'El email no es válido',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                placeholder="tu@email.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                disabled={loading}
                error={!!errors.email}
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
              />
            )}
          />
          {errors.email && (
            <Text variant="bodySmall" style={styles.fieldError}>
              {errors.email.message}
            </Text>
          )}

          {/* Campo de Contraseña */}
          <Controller
            control={control}
            name="contrasena"
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres',
              },
            }}
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
                autoComplete="password-new"
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

          {/* Campo de Confirmar Contraseña */}
          <Controller
            control={control}
            name="confirmarContrasena"
            rules={{
              required: 'Debes confirmar tu contraseña',
              validate: (value) =>
                value === password || 'Las contraseñas no coinciden',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirmar Contraseña"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                disabled={loading}
                error={!!errors.confirmarContrasena}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
              />
            )}
          />
          {errors.confirmarContrasena && (
            <Text variant="bodySmall" style={styles.fieldError}>
              {errors.confirmarContrasena.message}
            </Text>
          )}

          {/* Mensaje de error general */}
          {error && (
            <View style={styles.errorContainer}>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* Botón de Registrarse */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            loading={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          {/* Enlace para iniciar sesión */}
          <View style={styles.loginContainer}>
            <Text variant="bodyMedium" style={styles.loginText}>
              ¿Ya tienes una cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login' as any)}>
              <Text variant="bodyMedium" style={styles.loginLink}>
                Inicia sesión
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
    marginBottom: 32,
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
  photoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  photoLabel: {
    color: '#666666',
    marginBottom: 12,
  },
  photoSelectorContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  photoSelector: {
    width: 120,
    height: 120,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#6CB4EE',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D32F2F',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  photoPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  photoPlaceholderText: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
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
  fieldError: {
    color: '#C62828',
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#666666',
  },
  loginLink: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
});
