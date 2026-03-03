import { useVerifyEmail } from '@/features/auth/hooks/auth.hook';
import { VerifyEmailRequest } from '@/features/auth/interfaces/verify-email.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';

interface VerifyEmailModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
}

export function VerifyEmailModal({ visible, onDismiss, onSuccess }: VerifyEmailModalProps) {
  const { verifyEmail, loading, error, setError } = useVerifyEmail();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VerifyEmailRequest>({
    defaultValues: { codigo: '' },
  });

  const onSubmit = async (data: VerifyEmailRequest) => {
    const ok = await verifyEmail(data);
    if (ok) {
      Toast.show({
        type: 'success',
        text1: 'Email verificado',
        text2: 'Tu correo ha sido verificado correctamente',
        position: 'top',
        visibilityTime: 3000,
      });
      reset();
      onDismiss();
      onSuccess?.();
    }
  };

  const handleDismiss = () => {
    reset();
    setError(null);
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
              Verificar correo
            </Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text variant="bodyMedium" style={styles.hint}>
              Ingresá el código que te enviamos a tu correo electrónico.
            </Text>

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
              name="codigo"
              rules={{
                required: 'El código es obligatorio',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Código de verificación"
                  placeholder="Ej: 123456"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  autoCapitalize="none"
                  autoComplete="one-time-code"
                  keyboardType="number-pad"
                  disabled={loading}
                  error={!!errors.codigo}
                  style={styles.input}
                />
              )}
            />
            {errors.codigo && (
              <Text variant="bodySmall" style={styles.fieldError}>
                {errors.codigo.message}
              </Text>
            )}
          </View>

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
              Verificar
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  hint: {
    color: '#666666',
    marginBottom: 16,
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
