import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Portal, Text } from 'react-native-paper';

interface ConfirmacionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmacionModal({
  visible,
  onDismiss,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
}: ConfirmacionModalProps) {
  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onDismiss}
            disabled={loading}
          />
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="alert-circle" size={48} color="#FF9800" />
              </View>
              <Text variant="titleLarge" style={styles.title}>
                {title}
              </Text>
              <Text variant="bodyMedium" style={styles.message}>
                {message}
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  disabled={loading}
                  style={[styles.button, styles.cancelButton]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.cancelButtonLabel}
                >
                  {cancelText}
                </Button>
                <Button
                  mode="contained"
                  onPress={onConfirm}
                  disabled={loading}
                  loading={loading}
                  style={[styles.button, styles.confirmButton]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.confirmButtonLabel}
                >
                  {confirmText}
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#E74C3C',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  cancelButtonLabel: {
    color: '#666666',
    fontWeight: '600',
  },
  confirmButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
