import { useInfoInicial, useInfoInicialById, useUpdateInfoInicial } from '@/features/info-inicial/hooks/info-inicial.hook';
import { InfoInicialRequest } from '@/features/info-inicial/interfaces/info-inicial.interface';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Menu, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { MedioPagoModal } from './medio-pago-modal';

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
  // Estado para guardar el texto sin formatear mientras el usuario escribe
  const [montoTextInputs, setMontoTextInputs] = useState<Record<string, string>>({});
  const { data: infoInicialData, loading: loadingInfo, fetchById } = useInfoInicialById(infoInicialId);
  const { data: mediosPago, fetchMediosPago } = useMediosPago();
  const { update, loading: updating, error: updateError } = useUpdateInfoInicial();
  const { submit, loading: creating, error: createError } = useInfoInicial();

  const isEditMode = !!infoInicialId;
  const isLoading = updating || creating;
  const error = updateError || createError;

  const getInputKey = (medioPagoId: number | null, tempId: string | undefined): string => {
    return tempId || `medio-${medioPagoId}` || 'unknown';
  };

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
      
      // Inicializar los textos formateados para los inputs
      const textosIniciales: Record<string, string> = {};
      mediosPagoIniciales.forEach((mp) => {
        const key = getInputKey(mp.medioPagoId, undefined);
        textosIniciales[key] = formatMonto(mp.monto);
      });
      setMontoTextInputs(textosIniciales);
    } else if (!isEditMode && mediosPago && visible) {
      // En modo creación, no inicializar ningún medio de pago (se agregan manualmente)
      setMediosPagoEdit([]);
      setAnio(getCurrentYear());
      setMes(getCurrentMonth());
      setMontoTextInputs({});
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

  // Formatear número para mostrar: $ 76.271,62
  const formatMonto = (monto: number, mostrarDecimales: boolean = true): string => {
    if (monto === 0) return '';
    
    // Separar parte entera y decimal
    const partes = mostrarDecimales ? monto.toFixed(2).split('.') : [Math.floor(monto).toString(), '00'];
    const parteEntera = partes[0];
    const parteDecimal = partes[1];
    
    // Agregar puntos cada 3 dígitos desde la derecha
    const parteEnteraFormateada = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `$ ${parteEnteraFormateada},${parteDecimal}`;
  };

  // Parsear número del formato visual al numérico: $ 76.271,62 -> 76271.62
  const parseMonto = (valor: string): number => {
    if (!valor || valor.trim() === '') return 0;
    
    // Remover $ y espacios
    let limpio = valor.replace(/[$.\s]/g, '');
    
    // Manejar coma como separador decimal
    // Si hay coma, reemplazarla por punto para decimales
    // Si hay múltiples comas, solo la última es decimal
    const ultimaComa = limpio.lastIndexOf(',');
    if (ultimaComa !== -1) {
      // La parte antes de la última coma es entera, la parte después es decimal
      const parteEntera = limpio.substring(0, ultimaComa).replace(/,/g, '');
      const parteDecimal = limpio.substring(ultimaComa + 1);
      limpio = parteEntera + '.' + parteDecimal;
    }
    
    const numero = parseFloat(limpio);
    return isNaN(numero) ? 0 : numero;
  };

  const handleMontoChange = (medioPagoId: number | null, tempId: string | undefined, text: string) => {
    const inputKey = getInputKey(medioPagoId, tempId);
    
    // Guardar el texto sin formatear mientras el usuario escribe
    setMontoTextInputs((prev) => ({
      ...prev,
      [inputKey]: text,
    }));
    
    // Remover todo excepto números, puntos y comas
    let limpio = text.replace(/[^0-9.,]/g, '');
    
    // Si está vacío, establecer monto en 0
    if (!limpio || limpio.trim() === '') {
      setMediosPagoEdit((prev) =>
        prev.map((mp) => {
          if (tempId && mp.tempId === tempId) {
            return { ...mp, monto: 0 };
          } else if (medioPagoId && mp.medioPagoId === medioPagoId) {
            return { ...mp, monto: 0 };
          }
          return mp;
        })
      );
      return;
    }
    
    // Parsear el valor
    const monto = parseMonto(limpio);
    
    setMediosPagoEdit((prev) =>
      prev.map((mp) => {
        if (tempId && mp.tempId === tempId) {
          return { ...mp, monto };
        } else if (medioPagoId && mp.medioPagoId === medioPagoId) {
          return { ...mp, monto };
        }
        return mp;
      })
    );
  };

  const handleMontoBlur = (medioPagoId: number | null, tempId: string | undefined) => {
    const inputKey = getInputKey(medioPagoId, tempId);
    const textoActual = montoTextInputs[inputKey];
    
    if (textoActual) {
      const limpio = textoActual.replace(/[^0-9.,]/g, '');
      const monto = parseMonto(limpio);
      
      // Formatear el valor cuando el usuario termina de escribir
      setMontoTextInputs((prev) => ({
        ...prev,
        [inputKey]: monto > 0 ? formatMonto(monto) : '',
      }));
    }
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

          {/* Texto explicativo */}
          <View style={styles.explanationContainer}>
            <MaterialCommunityIcons name="information" size={18} color="#6CB4EE" />
            <Text variant="bodySmall" style={styles.explanationText}>
              Esta es la cantidad de dinero con la que iniciaste este mes
            </Text>
          </View>

          {loadingInfo && isEditMode ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6CB4EE" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Cargando información...
              </Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {/* Mes y Año - Solo en modo creación */}
                {!isEditMode && (
                  <>
                    <View style={styles.formRow}>
                      <Text variant="bodyMedium" style={styles.formLabel}>
                        Mes
                      </Text>
                      <Menu
                        visible={mesMenuVisible}
                        onDismiss={() => setMesMenuVisible(false)}
                        anchor={
                          <TouchableOpacity
                            style={styles.formSelect}
                            onPress={() => setMesMenuVisible(true)}
                          >
                            <Text style={styles.formSelectText}>{mes}</Text>
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

                    <View style={styles.formRow}>
                      <Text variant="bodyMedium" style={styles.formLabel}>
                        Año
                      </Text>
                      <TouchableOpacity
                        style={styles.formSelect}
                        disabled={true}
                      >
                        <Text style={styles.formSelectText}>{anio}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Mes y Año - Solo en modo edición */}
                {isEditMode && infoInicialData && (
                  <Text variant="bodyMedium" style={styles.modalSubtitle}>
                    {infoInicialData.mes} {infoInicialData.anio}
                  </Text>
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
                  <View style={styles.emptyMediosPago}>
                    <MaterialCommunityIcons name="wallet-outline" size={48} color="#CCCCCC" />
                    <Text variant="bodyMedium" style={styles.emptyMediosPagoText}>
                      No hay medios de pago agregados
                    </Text>
                    <Text variant="bodySmall" style={styles.emptyMediosPagoSubtext}>
                      Presiona "Agregar" para agregar un medio de pago
                    </Text>
                  </View>
                ) : (
                  mediosPagoEdit.map((medioEdit, index) => {
                    const medio = medioEdit.medioPagoId
                      ? mediosPago?.find((mp) => mp.id === medioEdit.medioPagoId)
                      : null;

                    return (
                      <View key={medioEdit.tempId || medioEdit.medioPagoId || index} style={styles.medioPagoEditItem}>
                        <View style={styles.medioPagoEditHeader}>
                          {medio ? (
                            <MaterialCommunityIcons
                              name={getMedioPagoIcon(medio.tipo) as any}
                              size={24}
                              color="#6CB4EE"
                            />
                          ) : (
                            <MaterialCommunityIcons name="credit-card-outline" size={24} color="#CCCCCC" />
                          )}
                          <View style={styles.medioPagoEditInfo}>
                            {medio ? (
                              <>
                                <Text variant="bodyLarge" style={styles.medioPagoEditName}>
                                  {medio.nombre}
                                </Text>
                                <Text variant="bodySmall" style={styles.medioPagoEditTipo}>
                                  {medio.tipo === 'BILLETERA_VIRTUAL' ? 'Billetera Virtual' : 'Banco'}
                                </Text>
                              </>
                            ) : (
                              <TouchableOpacity
                                style={styles.medioPagoSelect}
                                onPress={() => handleAbrirMedioPagoModal(medioEdit.tempId || '')}
                              >
                                <Text style={styles.medioPagoSelectText}>
                                  Seleccionar medio de pago
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
                              </TouchableOpacity>
                            )}
                          </View>
                          <TouchableOpacity
                            onPress={() => handleEliminarMedioPago(medioEdit.medioPagoId, medioEdit.tempId)}
                            style={styles.deleteButton}
                          >
                            <MaterialCommunityIcons name="close-circle" size={24} color="#E74C3C" />
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          label="Monto"
                          placeholder="0.00"
                          value={montoTextInputs[getInputKey(medioEdit.medioPagoId, medioEdit.tempId)] || (medioEdit.monto > 0 ? formatMonto(medioEdit.monto) : '')}
                          onChangeText={(text) => handleMontoChange(medioEdit.medioPagoId, medioEdit.tempId, text)}
                          onBlur={() => handleMontoBlur(medioEdit.medioPagoId, medioEdit.tempId)}
                          mode="outlined"
                          keyboardType="numeric"
                          disabled={isLoading}
                          style={styles.input}
                          contentStyle={styles.inputContent}
                          outlineStyle={styles.inputOutline}
                          left={<TextInput.Icon icon="currency-usd" />}
                        />
                      </View>
                    );
                  })
                )}

                {error && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {error}
                  </Text>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  style={styles.modalButton}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.modalButton}
                  loading={isLoading}
                  disabled={isLoading || (isEditMode && loadingInfo)}
                  buttonColor="#6CB4EE"
                >
                  {isEditMode ? 'Guardar' : 'Crear'}
                </Button>
              </View>
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
    marginHorizontal: 20,
    marginBottom: 0,
    marginTop: 8,
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
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  modalSubtitle: {
    color: '#666666',
    marginBottom: 10,
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
  errorText: {
    color: '#D32F2F',
    marginTop: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
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
  formSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formSelectText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
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
  emptyMediosPago: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyMediosPagoText: {
    marginTop: 16,
    color: '#666666',
    textAlign: 'center',
  },
  emptyMediosPagoSubtext: {
    marginTop: 8,
    color: '#999999',
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  medioPagoSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  medioPagoSelectText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
});
