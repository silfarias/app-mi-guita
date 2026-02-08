import {
  EmptyStateCard,
  FormActions,
  FormErrorBlock,
  LoadingStateBlock,
  MoneyInputForm,
  SelectTriggerField,
} from '@/common/components';
import { useInfoInicial, useInfoInicialById, useUpdateInfoInicial } from '@/features/info-inicial/hooks/info-inicial.hook';
import { InfoInicialRequest } from '@/features/info-inicial/interfaces/info-inicial.interface';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Menu, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { MedioPagoModal } from '../../medio-pago/components/medio-pago-modal';

interface InfoInicialModalProps {
  visible: boolean;
  onDismiss: () => void;
  infoInicialId?: number | null;
  onSuccess?: () => void;
}

export function InfoInicialModal({
  visible,
  onDismiss,
  infoInicialId,
  onSuccess,
}: InfoInicialModalProps) {
  const [mediosPagoEdit, setMediosPagoEdit] = useState<Array<{ medioPagoId: number | null; monto: number; tempId?: string }>>([]);
  const [anio, setAnio] = useState<number>(getCurrentYear());
  const [mes, setMes] = useState<string>(getCurrentMonth());
  const [mesMenuVisible, setMesMenuVisible] = useState(false);
  const [medioPagoModalVisible, setMedioPagoModalVisible] = useState<Record<string, boolean>>({});
  const [medioPagoModalTempId, setMedioPagoModalTempId] = useState<string | null>(null);
  const { data: infoInicialData, loading: loadingInfo, fetchById } = useInfoInicialById(infoInicialId);
  const { data: mediosPago, fetchMediosPago } = useMediosPago();
  const { update, loading: updating, error: updateError } = useUpdateInfoInicial();
  const { submit, loading: creating, error: createError } = useInfoInicial();

  const isEditMode = !!infoInicialId;
  const isLoading = updating || creating;
  const error = updateError || createError;

  const meses = [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
  ];

  // Cargar medios de pago cuando se abre el modal
  useEffect(() => {
    if (visible) {
      fetchMediosPago();
    }
  }, [visible]);

  // Cargar datos cuando se abre el modal en modo edición
  useEffect(() => {
    if (visible && isEditMode && infoInicialId) {
      fetchById();
    }
  }, [visible, isEditMode, infoInicialId]);

  // Inicializar medios de pago cuando se cargan los datos
  useEffect(() => {
    if (infoInicialData && isEditMode) {
      // En modo edición, solo mostrar los medios de pago que ya tienen montos
      const mediosPagoIniciales = infoInicialData.mediosPago
        .filter((mp) => parseFloat(mp.monto) > 0)
        .map((mp) => ({
          medioPagoId: mp.medioPago.id as number,
          monto: parseFloat(mp.monto),
        }));
      setMediosPagoEdit(mediosPagoIniciales);
      setAnio(infoInicialData.anio);
      setMes(infoInicialData.mes);
    } else if (!isEditMode && mediosPago && visible) {
      // En modo creación, mostrar una tarjeta por defecto para cargar por medio de pago
      const tempId = `temp-${Date.now()}`;
      setMediosPagoEdit([{ medioPagoId: null, monto: 0, tempId }]);
      setAnio(getCurrentYear());
      setMes(getCurrentMonth());
    }
  }, [infoInicialData, isEditMode, mediosPago, visible]);

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      setMediosPagoEdit([]);
      setAnio(getCurrentYear());
      setMes(getCurrentMonth());
    }
  }, [visible]);

  const getMedioPagoIcon = (tipo: string) => {
    switch (tipo) {
      case 'BILLETERA_VIRTUAL':
        return 'wallet';
      case 'BANCO':
        return 'bank';
      default:
        return 'credit-card';
    }
  };


  const handleAgregarMedioPago = () => {
    // Agregar un nuevo item temporal sin medio de pago seleccionado
    const tempId = `temp-${Date.now()}`;
    setMediosPagoEdit((prev) => [{ medioPagoId: null, monto: 0, tempId }, ...prev]);
  };

  const handleSeleccionarMedioPago = (medio: { id: number }) => {
    if (medioPagoModalTempId) {
      setMediosPagoEdit((prev) =>
        prev.map((mp) => (mp.tempId === medioPagoModalTempId ? { ...mp, medioPagoId: medio.id } : mp))
      );
      setMedioPagoModalTempId(null);
    }
    setMedioPagoModalVisible({});
  };

  const handleAbrirMedioPagoModal = (tempId: string) => {
    setMedioPagoModalTempId(tempId);
    setMedioPagoModalVisible((prev) => ({ ...prev, [tempId]: true }));
  };

  const handleCerrarMedioPagoModal = () => {
    setMedioPagoModalVisible({});
    setMedioPagoModalTempId(null);
  };

  const handleEliminarMedioPago = (medioPagoId: number | null, tempId?: string) => {
    if (tempId) {
      setMediosPagoEdit((prev) => prev.filter((mp) => mp.tempId !== tempId));
    } else if (medioPagoId) {
      setMediosPagoEdit((prev) => prev.filter((mp) => mp.medioPagoId !== medioPagoId));
    }
  };

  const handleMontoChange = (
    medioPagoId: number | null,
    tempId: string | undefined,
    value: number
  ) => {
    setMediosPagoEdit((prev) =>
      prev.map((mp) => {
        if (tempId && mp.tempId === tempId) return { ...mp, monto: value };
        if (medioPagoId && mp.medioPagoId === medioPagoId) return { ...mp, monto: value };
        return mp;
      })
    );
  };

  const handleSave = async () => {
    if (!infoInicialData && isEditMode) return;

    // Filtrar medios de pago válidos (con medioPagoId seleccionado y monto > 0)
    const mediosPagoFiltrados = mediosPagoEdit
      .filter((mp) => mp.medioPagoId !== null && mp.monto > 0)
      .map((mp) => ({
        medioPagoId: mp.medioPagoId!,
        monto: mp.monto,
      }));
    
    if (mediosPagoFiltrados.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Debes agregar al menos un medio de pago con monto mayor a 0',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    const request: InfoInicialRequest = {
      anio: isEditMode ? (infoInicialData?.anio || anio) : anio,
      mes: isEditMode ? (infoInicialData?.mes || mes) : mes,
      mediosPago: mediosPagoFiltrados,
    };

    try {
      if (isEditMode && infoInicialData) {
        await update(infoInicialData.id, request);
        Toast.show({
          type: 'success',
          text1: '¡Información actualizada!',
          text2: 'La información inicial se ha actualizado exitosamente',
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        await submit(request);
        Toast.show({
          type: 'success',
          text1: '¡Información creada!',
          text2: 'La información inicial se ha creado exitosamente',
          position: 'top',
          visibilityTime: 3000,
        });
      }
      onSuccess?.();
      onDismiss();
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {isEditMode ? 'Editar Información Inicial' : 'Nueva Información Inicial'}
            </Text>
            <TouchableOpacity onPress={onDismiss}>
              <MaterialCommunityIcons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {loadingInfo && isEditMode ? (
            <LoadingStateBlock
              message="Cargando información..."
              color="#6CB4EE"
              style={styles.loadingContainer}
            />
          ) : (
            <>
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {/* Texto explicativo - scroll con el contenido */}
                <View style={styles.explanationContainer}>
                  <MaterialCommunityIcons name="information" size={18} color="#6CB4EE" />
                  <Text variant="bodySmall" style={styles.explanationText}>
                    Esta es la cantidad de dinero con la que iniciaste este mes, si no recuerdas
                    puedes registrar cuánto dinero tienes a partir de hoy.
                  </Text>
                </View>

                {/* Período: Mes y Año en formato FEBRERO 2026 */}
                {!isEditMode && (
                  <View style={styles.periodoRow}>
                    <Text variant="bodyMedium" style={styles.formLabel}>
                      Período
                    </Text>
                    <Menu
                      visible={mesMenuVisible}
                      onDismiss={() => setMesMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          style={styles.periodoDisplay}
                          onPress={() => setMesMenuVisible(true)}
                        >
                          <Text variant="titleMedium" style={styles.periodoDisplayText}>
                            {mes} {anio}
                          </Text>
                          <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
                        </TouchableOpacity>
                      }
                      contentStyle={styles.menuDropdownContent}
                    >
                      {meses.map((mesOption) => (
                        <Menu.Item
                          key={mesOption}
                          onPress={() => {
                            setMes(mesOption);
                            setMesMenuVisible(false);
                          }}
                          title={mesOption}
                        />
                      ))}
                    </Menu>
                  </View>
                )}

                {isEditMode && infoInicialData && (
                  <View style={styles.periodoRow}>
                    <Text variant="bodyMedium" style={styles.formLabel}>
                      Período
                    </Text>
                    <View style={styles.periodoDisplayReadOnly}>
                      <Text variant="titleMedium" style={styles.periodoDisplayText}>
                        {infoInicialData.mes} {infoInicialData.anio}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.sectionHeader}>
                  <Text variant="titleMedium" style={styles.modalSectionTitle}>
                    Medios de Pago
                  </Text>
                  <View style={styles.agregarButtonContainer}>
                    <TouchableOpacity
                      style={styles.agregarButton}
                      onPress={handleAgregarMedioPago}
                    >
                      <MaterialCommunityIcons name="plus-circle" size={20} color="#6CB4EE" />
                      <Text variant="bodyMedium" style={styles.agregarButtonText}>
                        Agregar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {mediosPagoEdit.length === 0 ? (
                  <EmptyStateCard
                    icon="wallet-outline"
                    iconColor="#CCCCCC"
                    iconSize={48}
                    title="No hay medios de pago agregados"
                    description='Presiona "Agregar" para agregar un medio de pago'
                    style={styles.emptyMediosPagoCard}
                  />
                ) : (
                  mediosPagoEdit.map((medioEdit, index) => {
                    const medio = medioEdit.medioPagoId
                      ? mediosPago?.find((mp) => mp.id === medioEdit.medioPagoId)
                      : null;

                    return (
                      <View key={medioEdit.tempId || medioEdit.medioPagoId || index} style={styles.medioPagoEditItem}>
                        {mediosPagoEdit.length > 1 && (
                          <View style={styles.itemHeader}>
                            <TouchableOpacity
                              onPress={() => handleEliminarMedioPago(medioEdit.medioPagoId, medioEdit.tempId)}
                              style={styles.deleteButton}
                              disabled={isLoading}
                            >
                              <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                            </TouchableOpacity>
                          </View>
                        )}
                        <View style={styles.medioPagoEditHeader}>
                          <View style={styles.medioPagoEditInfo}>
                            <SelectTriggerField
                              label="Medio de pago"
                              placeholder="Seleccionar medio de pago"
                              selectedContent={
                                medio ? (
                                  <View style={styles.medioPagoSelectedContent}>
                                    <Text variant="bodyLarge" style={styles.medioPagoEditName}>
                                      {medio.nombre}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.medioPagoEditTipo}>
                                      {medio.tipo === 'BILLETERA_VIRTUAL' ? 'Billetera' : 'Banco'}
                                    </Text>
                                  </View>
                                ) : undefined
                              }
                              onPress={() => handleAbrirMedioPagoModal(medioEdit.tempId || '')}
                              disabled={isLoading}
                              containerStyle={styles.medioPagoSelectTrigger}
                              triggerStyle={styles.medioPagoTriggerBox}
                            />
                          </View>
                        </View>
                        <MoneyInputForm
                          label="Monto"
                          placeholder="0,00"
                          value={medioEdit.monto}
                          onChange={(value) =>
                            handleMontoChange(medioEdit.medioPagoId, medioEdit.tempId, value)
                          }
                          disabled={isLoading}
                          min={0}
                          style={styles.moneyInput}
                          showCurrencyIcon
                        />
                      </View>
                    );
                  })
                )}

                {error && <FormErrorBlock message={error} />}
              </ScrollView>

              <FormActions
                cancelLabel="Cancelar"
                submitLabel={isEditMode ? 'Guardar' : 'Crear'}
                onCancel={onDismiss}
                onSubmit={handleSave}
                disabled={isLoading || (isEditMode && loadingInfo)}
                loading={isLoading}
                submitButtonColor="#6CB4EE"
                style={styles.modalActions}
              />
            </>
          )}
        </View>
      </View>

      {/* Modal de selección de medio de pago */}
      <MedioPagoModal
        visible={Object.values(medioPagoModalVisible).some((v) => v)}
        onDismiss={handleCerrarMedioPagoModal}
        onSelect={handleSeleccionarMedioPago}
      />
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#333333',
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: 12,
    marginBottom: 16,
    marginTop: 0,
    borderRadius: 8,
  },
  explanationText: {
    flex: 1,
    color: '#666666',
    lineHeight: 18,
  },
  modalScrollView: {
    height: 'auto',
    padding: 20,
    marginTop: 0
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodoRow: {
    marginBottom: 16,
  },
  periodoDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 56,
  },
  periodoDisplayReadOnly: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 56,
    justifyContent: 'center',
  },
  periodoDisplayText: {
    fontWeight: '600',
    color: '#333333',
    fontSize: 16,
  },
  modalSectionTitle: {
    fontWeight: '600',
    color: '#333333',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  medioPagoEditItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  medioPagoEditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  medioPagoEditInfo: {
    flex: 1,
  },
  medioPagoEditName: {
    fontWeight: '600',
    color: '#333333',
  },
  medioPagoEditTipo: {
    color: '#666666',
    marginTop: 2,
  },
  medioPagoSelectTrigger: {
    marginTop: 0,
    flex: 1,
  },
  medioPagoTriggerBox: {
    minHeight: 48,
  },
  medioPagoSelectedContent: {
    flex: 1,
  },
  moneyInput: {
    marginTop: 4,
    marginBottom: 0,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  emptyMediosPagoCard: {
    marginBottom: 16,
  },
  formRow: {
    marginBottom: 0,
    marginTop: 16
  },
  formLabel: {
    marginBottom: 8,
    color: '#666666',
    fontWeight: '500' 
  },
  formInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  menuDropdownContent: {
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  agregarButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  agregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  agregarButtonText: {
    color: '#6CB4EE',
    fontWeight: '600',
    fontSize: 13,
    includeFontPadding: false,
    textAlignVertical: 'center',
    flexShrink: 0,
  },
  deleteButton: {
    padding: 4,
  },
});
