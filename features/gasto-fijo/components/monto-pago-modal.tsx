import { MoneyInputForm } from '@/common/components';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, Portal, Text } from 'react-native-paper';
import { useState } from 'react';

export interface MontoPagoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (monto: number) => Promise<void>;
  gastoNombre: string;
  loading?: boolean;
}

export function MontoPagoModal({
  visible,
  onDismiss,
  onConfirm,
  gastoNombre,
  loading = false,
}: MontoPagoModalProps) {
  const [monto, setMonto] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (monto <= 0) {
      setError('Ingresá el monto que pagaste');
      return;
    }
    setError(null);
    try {
      await onConfirm(monto);
      setMonto(0);
      onDismiss();
    } catch {
      // Error manejado por el padre
    }
  };

  const handleDismiss = () => {
    setMonto(0);
    setError(null);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <View style={styles.backdrop}>
          <View style={styles.container}>
            <View style={styles.content}>
              <Text variant="titleLarge" style={styles.title}>
                ¿Cuánto pagaste?
              </Text>
              <Text variant="bodyMedium" style={styles.message}>
                {gastoNombre} tiene un monto variable. Ingresá cuánto pagaste este mes:
              </Text>
              <View style={styles.inputWrapper}>
                <MoneyInputForm
                  value={monto}
                  onChange={setMonto}
                  label="Monto pagado"
                  error={error ?? undefined}
                  min={0}
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleDismiss}
                  disabled={loading}
                  style={[styles.button, styles.cancelButton]}
                  contentStyle={styles.buttonContent}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  disabled={loading || monto <= 0}
                  loading={loading}
                  style={[styles.button, styles.confirmButton]}
                  contentStyle={styles.buttonContent}
                >
                  Guardar
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
    width: '90%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#6CB4EE',
  },
  buttonContent: {
    paddingVertical: 4,
  },
});
