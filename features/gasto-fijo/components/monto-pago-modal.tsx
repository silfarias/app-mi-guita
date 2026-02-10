import { MoneyInputForm, SelectTriggerField } from '@/common/components';
import { MedioPagoModal } from '@/features/medio-pago/components/medio-pago-modal';
import { MedioPago } from '@/features/medio-pago/interfaces/medio-pago.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, Portal, Text } from 'react-native-paper';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';

export interface MontoPagoModalProps {
  visible: boolean;
  onDismiss: () => void;
  /** Al confirmar: monto y opcionalmente medioPagoId (cuando requireMedioPago es true, el modal lo envía). */
  onConfirm: (monto: number, medioPagoId?: number) => Promise<void>;
  gastoNombre: string;
  loading?: boolean;
  /** Si es true, el modal pide también medio de pago (gasto no es débito automático). */
  requireMedioPago?: boolean;
  /** Cuando el gasto es débito automático: mostrar este medio como asociado (solo informativo, no se elige). */
  medioPagoAsociado?: { id: number; nombre: string };
}

const selectItemRow = { flexDirection: 'row' as const, alignItems: 'center' as const, flex: 1 };
const selectItemIcon = { marginRight: 8 };

export function MontoPagoModal({
  visible,
  onDismiss,
  onConfirm,
  gastoNombre,
  loading = false,
  requireMedioPago = false,
  medioPagoAsociado,
}: MontoPagoModalProps) {
  const [monto, setMonto] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [medioError, setMedioError] = useState<string | null>(null);
  const [selectedMedio, setSelectedMedio] = useState<MedioPago | null>(null);
  const [medioModalVisible, setMedioModalVisible] = useState(false);

  const { fetchMediosPago } = useMediosPago();
  useEffect(() => {
    if (visible && requireMedioPago) fetchMediosPago();
  }, [visible, requireMedioPago]);

  const handleConfirm = async () => {
    if (monto <= 0) {
      setError('Ingresá el monto que pagaste');
      return;
    }
    if (requireMedioPago && !selectedMedio) {
      setMedioError('Seleccioná el medio de pago');
      return;
    }
    setError(null);
    setMedioError(null);
    try {
      await onConfirm(monto, selectedMedio?.id);
      setMonto(0);
      setSelectedMedio(null);
      onDismiss();
    } catch {
      // Error manejado por el padre
    }
  };

  const handleDismiss = () => {
    setMonto(0);
    setError(null);
    setMedioError(null);
    setSelectedMedio(null);
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
                {medioPagoAsociado
                  ? `${gastoNombre} (débito automático). Ingresá el monto pagado:`
                  : `${gastoNombre} tiene un monto variable. Ingresá cuánto pagaste este mes:`}
              </Text>
              {medioPagoAsociado && (
                <View style={styles.medioAsociadoRow}>
                  <MaterialCommunityIcons name="bank" size={18} color="#6CB4EE" style={selectItemIcon} />
                  <Text variant="bodySmall" style={styles.medioAsociadoText}>
                    Medio: {medioPagoAsociado.nombre}
                  </Text>
                </View>
              )}
              <View style={styles.inputWrapper}>
                <MoneyInputForm
                  value={monto}
                  onChange={setMonto}
                  label="Monto pagado"
                  error={error ?? undefined}
                  min={0}
                />
              </View>
              {requireMedioPago && (
                <View style={styles.inputWrapper}>
                  <SelectTriggerField
                    label="Medio de pago"
                    placeholder="Seleccionar medio de pago"
                    selectedContent={
                      selectedMedio ? (
                        <View style={selectItemRow}>
                          <MaterialCommunityIcons
                            name={selectedMedio.tipo === 'BANCO' ? 'bank' : 'wallet'}
                            size={20}
                            color="#6CB4EE"
                            style={selectItemIcon}
                          />
                          <Text variant="bodyMedium" style={{ color: '#333333', fontWeight: '500' }}>
                            {selectedMedio.nombre}
                          </Text>
                        </View>
                      ) : undefined
                    }
                    onPress={() => setMedioModalVisible(true)}
                    error={medioError ?? undefined}
                    disabled={loading}
                  />
                  <MedioPagoModal
                    visible={medioModalVisible}
                    onDismiss={() => setMedioModalVisible(false)}
                    onSelect={(m) => {
                      setSelectedMedio(m);
                      setMedioModalVisible(false);
                      setMedioError(null);
                    }}
                    selectedValue={selectedMedio?.id}
                    disabled={loading}
                  />
                </View>
              )}
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
                  disabled={loading || monto <= 0 || (requireMedioPago && !selectedMedio)}
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
  medioAsociadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  medioAsociadoText: {
    color: '#1565C0',
    fontWeight: '500',
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
