import { useChangePassword } from '@/features/auth/hooks/auth.hook';
import { ChangePasswordRequest } from '@/features/auth/interfaces/change-password.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';

interface ChangePasswordModalProps {
  visible: boolean;
  onDismiss: () => void;
  email: string;
}

export function ChangePasswordModal({ visible, onDismiss, email }: ChangePasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword, loading, error, success, setError, setSuccess } = useChangePassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordRequest>({
    defaultValues: {
      email: email,
      contrasena: '',
      confirmarContrasena: '',
    },
  });

  const onSubmit = async (data: ChangePasswordRequest) => {
    const success = await changePassword(data);
    if (success) {
      reset();
      setTimeout(() => {
        onDismiss();
        setSuccess(null);
      }, 1500);
    }
  };

  const handleDismiss = () => {
    reset();
    setError(null);
    setSuccess(null);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Cambiar Contraseña
            </Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {success && (
              <View style={styles.successContainer}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#27AE60" />
                <Text variant="bodyMedium" style={styles.successText}>
                  {success}
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={24} color="#D32F2F" />
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

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
                  label="Nueva Contraseña"
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
                />
              )}
            />
            {errors.contrasena && (
              <Text variant="bodySmall" style={styles.fieldError}>
                {errors.contrasena.message}
              </Text>
            )}

            <Controller
              control={control}
              name="confirmarContrasena"
              rules={{
                required: 'Debes confirmar la contraseña',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Confirmar Nueva Contraseña"
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
                />
              )}
            />
            {errors.confirmarContrasena && (
              <Text variant="bodySmall" style={styles.fieldError}>
                {errors.confirmarContrasena.message}
              </Text>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={handleDismiss}
              style={styles.modalButton}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.modalButton}
              loading={loading}
              disabled={loading}
              buttonColor="#6CB4EE"
            >
              Confirmar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: '#27AE60',
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#D32F2F',
    flex: 1,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  fieldError: {
    color: '#D32F2F',
    marginBottom: 16,
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
