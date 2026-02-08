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
import { Button, Text, TextInput } from 'react-native-paper';

import { AuthFooterLink } from '@/components/auth-footer-link';
import { AuthSectionHeader } from '@/components/auth-section-header';
import { MiGuitaBrand } from '@/components/miguita-brand';
import { FormErrorBlock, TextInputFormField } from '@/common/components';
import { useSignupForm } from '@/features/auth/hooks/auth.hook';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';


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

          <AuthSectionHeader
            title="Crear Cuenta"
            subtitle="Únete a MiGuita y comienza a gestionar tu dinero"
          />

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
                            source={{ uri: typeof (value as any)?.uri === 'string' ? (value as any).uri : String(value ?? '') }}
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
                        <Text style={styles.photoPlaceholderIcon}>
                        <Entypo name="camera" size={30} color="black" />
                        </Text>
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

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInputFormField
                control={control}
                name="nombre"
                rules={{
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                }}
                label="Nombre"
                placeholder="Juan"
                disabled={loading}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
            <View style={styles.halfInput}>
              <TextInputFormField
                control={control}
                name="apellido"
                rules={{
                  required: 'El apellido es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El apellido debe tener al menos 2 caracteres',
                  },
                }}
                label="Apellido"
                placeholder="Pérez"
                disabled={loading}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

          <TextInputFormField
            control={control}
            name="nombreUsuario"
            rules={{
              required: 'El nombre de usuario es obligatorio',
              minLength: {
                value: 8,
                message: 'El nombre de usuario debe tener al menos 8 caracteres',
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'El nombre de usuario solo puede contener letras, números y guiones bajos',
              },
              validate: (value) => {
                const str = typeof value === 'string' ? value : String(value ?? '');
                if (!str) return true;
                const hasLetter = /[a-zA-Z]/.test(str);
                const hasNumber = /[0-9]/.test(str);
                if (!hasLetter || !hasNumber) {
                  return 'El nombre de usuario debe contener letras y números';
                }
                return true;
              },
            }}
            label="Nombre de Usuario"
            placeholder="tu_nombre_usuario"
            disabled={loading}
            autoCapitalize="none"
            autoComplete="username"
          />

          <TextInputFormField
            control={control}
            name="email"
            rules={{
              required: 'El email es obligatorio',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'El email no es válido',
              },
            }}
            label="Email"
            placeholder="tu@email.com"
            disabled={loading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInputFormField
            control={control}
            name="contrasena"
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres',
              },
            }}
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

          <TextInputFormField
            control={control}
            name="confirmarContrasena"
            rules={{
              required: 'Debes confirmar tu contraseña',
              validate: (value) =>
                value === password || 'Las contraseñas no coinciden',
            }}
            label="Confirmar Contraseña"
            placeholder="••••••••"
            disabled={loading}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoComplete="password"
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          {error && <FormErrorBlock message={error} />}

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

          <AuthFooterLink
            promptText="¿Ya tienes una cuenta?"
            linkText="Inicia sesión"
            onPress={() => router.push('/login' as any)}
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
    marginBottom: 10,
  },
  halfInput: {
    flex: 1,
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
