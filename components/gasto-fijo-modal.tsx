import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { useCreateBulkGastoFijo } from '@/features/gasto-fijo/hooks/gasto-fijo.hook';
import { GastoFijoRequest } from '@/features/gasto-fijo/interfaces/gasto-fijo.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Menu, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { CategoriaModal } from './categoria-modal';

interface GastoFijoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
}

export function GastoFijoModal({
  visible,
  onDismiss,
  onSuccess,
}: GastoFijoModalProps) {
  const [gastosFijosEdit, setGastosFijosEdit] = useState<Array<{ nombre: string; montoFijo: number; categoriaId: number | null; tempId?: string }>>([]);
  const [categoriaModalVisible, setCategoriaModalVisible] = useState<Record<string, boolean>>({});
  const [categoriaModalTempId, setCategoriaModalTempId] = useState<string | null>(null);
  // Estado para guardar el texto sin formatear mientras el usuario escribe
  const [montoTextInputs, setMontoTextInputs] = useState<Record<string, string>>({});
  const [nombreInputs, setNombreInputs] = useState<Record<string, string>>({});
  
  const { data: categorias, fetchCategorias } = useCategorias({ activo: true });
  const { createBulk, loading: creating, error: createError, reset } = useCreateBulkGastoFijo();

  // Cargar categorías cuando se abre el modal
  useEffect(() => {
    if (visible) {
      fetchCategorias({ activo: true });
    }
  }, [visible]);

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      setGastosFijosEdit([]);
      setMontoTextInputs({});
      setNombreInputs({});
      reset();
    }
  }, [visible]);

  const getInputKey = (tempId: string | undefined): string => {
    return tempId || 'unknown';
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
    const ultimaComa = limpio.lastIndexOf(',');
    if (ultimaComa !== -1) {
      const parteEntera = limpio.substring(0, ultimaComa).replace(/,/g, '');
      const parteDecimal = limpio.substring(ultimaComa + 1);
      limpio = parteEntera + '.' + parteDecimal;
    }
    
    const numero = parseFloat(limpio);
    return isNaN(numero) ? 0 : numero;
  };

  const handleMontoChange = (tempId: string | undefined, text: string) => {
    const inputKey = getInputKey(tempId);
    
    // Guardar el texto sin formatear mientras el usuario escribe
    setMontoTextInputs((prev) => ({
      ...prev,
      [inputKey]: text,
    }));
    
    // Remover todo excepto números, puntos y comas
    let limpio = text.replace(/[^0-9.,]/g, '');
    
    // Si está vacío, establecer monto en 0
    if (!limpio || limpio.trim() === '') {
      setGastosFijosEdit((prev) =>
        prev.map((gf) => {
          if (tempId && gf.tempId === tempId) {
            return { ...gf, montoFijo: 0 };
          }
          return gf;
        })
      );
      return;
    }
    
    // Parsear el valor
    const monto = parseMonto(limpio);
    
    setGastosFijosEdit((prev) =>
      prev.map((gf) => {
        if (tempId && gf.tempId === tempId) {
          return { ...gf, montoFijo: monto };
        }
        return gf;
      })
    );
  };

  const handleMontoBlur = (tempId: string | undefined) => {
    const inputKey = getInputKey(tempId);
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

  const handleNombreChange = (tempId: string | undefined, text: string) => {
    const inputKey = getInputKey(tempId);
    setNombreInputs((prev) => ({
      ...prev,
      [inputKey]: text,
    }));
    
    setGastosFijosEdit((prev) =>
      prev.map((gf) => {
        if (tempId && gf.tempId === tempId) {
          return { ...gf, nombre: text };
        }
        return gf;
      })
    );
  };

  const handleAgregarGastoFijo = () => {
    const tempId = `temp-${Date.now()}`;
    setGastosFijosEdit((prev) => [{ nombre: '', montoFijo: 0, categoriaId: null, tempId }, ...prev]);
  };

  const handleSeleccionarCategoria = (categoriaId: number) => {
    if (categoriaModalTempId) {
      setGastosFijosEdit((prev) =>
        prev.map((gf) => (gf.tempId === categoriaModalTempId ? { ...gf, categoriaId } : gf))
      );
      setCategoriaModalTempId(null);
    }
    setCategoriaModalVisible({});
  };

  const handleAbrirCategoriaModal = (tempId: string) => {
    setCategoriaModalTempId(tempId);
    setCategoriaModalVisible((prev) => ({ ...prev, [tempId]: true }));
  };

  const handleCerrarCategoriaModal = () => {
    setCategoriaModalVisible({});
    setCategoriaModalTempId(null);
  };

  const handleEliminarGastoFijo = (tempId?: string) => {
    if (tempId) {
      setGastosFijosEdit((prev) => prev.filter((gf) => gf.tempId !== tempId));
      // Limpiar inputs asociados
      const inputKey = getInputKey(tempId);
      setMontoTextInputs((prev) => {
        const nuevo = { ...prev };
        delete nuevo[inputKey];
        return nuevo;
      });
      setNombreInputs((prev) => {
        const nuevo = { ...prev };
        delete nuevo[inputKey];
        return nuevo;
      });
    }
  };

  const handleSave = async () => {
    // Filtrar gastos fijos válidos (con nombre, categoriaId seleccionado y monto > 0)
    const gastosFijosFiltrados = gastosFijosEdit
      .filter((gf) => gf.nombre.trim() !== '' && gf.categoriaId !== null && gf.montoFijo > 0)
      .map((gf) => ({
        nombre: gf.nombre.trim(),
        montoFijo: gf.montoFijo,
        categoriaId: gf.categoriaId!,
      }));
    
    if (gastosFijosFiltrados.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Debes agregar al menos un gasto fijo con nombre, categoría y monto mayor a 0',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      await createBulk({ gastosFijos: gastosFijosFiltrados });
      Toast.show({
        type: 'success',
        text1: '¡Gastos fijos creados!',
        text2: 'Los gastos fijos se han registrado exitosamente',
        position: 'top',
        visibilityTime: 3000,
      });
      onDismiss();
      if (onSuccess) {
        onSuccess();
      }
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
              Registrar Gastos Fijos
            </Text>
            <TouchableOpacity onPress={onDismiss}>
              <MaterialCommunityIcons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Texto explicativo */}
          <View style={styles.explanationContainer}>
            <MaterialCommunityIcons name="information" size={18} color="#6CB4EE" />
            <Text variant="bodySmall" style={styles.explanationText}>
              Los gastos fijos son pagos recurrentes que realizas cada mes (ej: alquiler, servicios, suscripciones)
            </Text>
          </View>

          {creating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6CB4EE" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Creando gastos fijos...
              </Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionHeader}>
                  <Text variant="titleMedium" style={styles.modalSectionTitle}>
                    Gastos Fijos
                  </Text>
                  <View style={styles.agregarButtonContainer}>
                    <TouchableOpacity
                      style={styles.agregarButton}
                      onPress={handleAgregarGastoFijo}
                    >
                      <MaterialCommunityIcons name="plus-circle" size={20} color="#6CB4EE" />
                      <Text variant="bodyMedium" style={styles.agregarButtonText}>
                        Agregar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {gastosFijosEdit.length === 0 ? (
                  <View style={styles.emptyGastosFijos}>
                    <MaterialCommunityIcons name="receipt-outline" size={48} color="#CCCCCC" />
                    <Text variant="bodyMedium" style={styles.emptyGastosFijosText}>
                      No hay gastos fijos agregados
                    </Text>
                    <Text variant="bodySmall" style={styles.emptyGastosFijosSubtext}>
                      Presiona "Agregar" para agregar un gasto fijo
                    </Text>
                  </View>
                ) : (
                  gastosFijosEdit.map((gastoFijoEdit, index) => {
                    const categoria = gastoFijoEdit.categoriaId
                      ? categorias?.find((c) => c.id === gastoFijoEdit.categoriaId)
                      : null;
                    const tempId = gastoFijoEdit.tempId || `item-${index}`;
                    const inputKey = getInputKey(gastoFijoEdit.tempId);

                    return (
                      <View key={tempId} style={styles.gastoFijoEditItem}>
                        <View style={styles.gastoFijoEditHeader}>
                          {categoria ? (
                            <View style={[styles.categoriaIconContainer, { backgroundColor: `${categoria.color}20` }]}>
                              <MaterialCommunityIcons
                                name={categoria.icono as any}
                                size={20}
                                color={categoria.color}
                              />
                            </View>
                          ) : (
                            <MaterialCommunityIcons name="tag-outline" size={24} color="#CCCCCC" />
                          )}
                          <View style={styles.gastoFijoEditInfo}>
                            {categoria ? (
                              <>
                                <Text variant="bodyLarge" style={styles.gastoFijoEditCategoria}>
                                  {categoria.nombre}
                                </Text>
                              </>
                            ) : (
                              <TouchableOpacity
                                style={styles.categoriaSelect}
                                onPress={() => handleAbrirCategoriaModal(tempId)}
                              >
                                <Text style={styles.categoriaSelectText}>
                                  Seleccionar categoría
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
                              </TouchableOpacity>
                            )}
                          </View>
                          <TouchableOpacity
                            onPress={() => handleEliminarGastoFijo(gastoFijoEdit.tempId)}
                            style={styles.deleteButton}
                          >
                            <MaterialCommunityIcons name="close-circle" size={24} color="#E74C3C" />
                          </TouchableOpacity>
                        </View>
                        
                        <TextInput
                          label="Nombre del gasto fijo"
                          placeholder="Ej: Internet/WiFi"
                          value={nombreInputs[inputKey] || gastoFijoEdit.nombre}
                          onChangeText={(text) => handleNombreChange(gastoFijoEdit.tempId, text)}
                          mode="outlined"
                          disabled={creating}
                          style={styles.input}
                          contentStyle={styles.inputContent}
                          outlineStyle={styles.inputOutline}
                          left={<TextInput.Icon icon="text" />}
                        />

                        <Text variant="bodySmall" style={styles.inputLabel}>
                          Si desconoces el monto o este no es fijo, puedes dejarlo en 0 y registrarlo cuando realices el pago.
                        </Text>
                        <TextInput
                          label="Monto fijo"
                          placeholder="0.00"
                          value={montoTextInputs[inputKey] || (gastoFijoEdit.montoFijo > 0 ? formatMonto(gastoFijoEdit.montoFijo) : '')}
                          onChangeText={(text) => handleMontoChange(gastoFijoEdit.tempId, text)}
                          onBlur={() => handleMontoBlur(gastoFijoEdit.tempId)}
                          mode="outlined"
                          keyboardType="numeric"
                          disabled={creating}
                          style={styles.input}
                          contentStyle={styles.inputContent}
                          outlineStyle={styles.inputOutline}
                          left={<TextInput.Icon icon="currency-usd" />}
                        />
                      </View>
                    );
                  })
                )}

                {createError && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {createError}
                  </Text>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  style={styles.modalButton}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.modalButton}
                  loading={creating}
                  disabled={creating}
                  buttonColor="#6CB4EE"
                >
                  Guardar
                </Button>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Modal de selección de categoría */}
      <CategoriaModal
        visible={Object.values(categoriaModalVisible).some((v) => v)}
        onDismiss={handleCerrarCategoriaModal}
        onSelect={handleSeleccionarCategoria}
        selectedValue={categoriaModalTempId ? (gastosFijosEdit.find((gf) => gf.tempId === categoriaModalTempId)?.categoriaId || undefined) : undefined}
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
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  explanationText: {
    flex: 1,
    color: '#666666',
    lineHeight: 18,
  },
  modalScrollView: {
    maxHeight: 400,
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  agregarButtonContainer: {
    flexDirection: 'row',
  },
  agregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  agregarButtonText: {
    color: '#6CB4EE',
    fontWeight: '600',
  },
  emptyGastosFijos: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyGastosFijosText: {
    marginTop: 16,
    color: '#666666',
    textAlign: 'center',
  },
  emptyGastosFijosSubtext: {
    marginTop: 8,
    color: '#999999',
    textAlign: 'center',
  },
  gastoFijoEditItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  gastoFijoEditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  categoriaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gastoFijoEditInfo: {
    flex: 1,
  },
  gastoFijoEditCategoria: {
    fontWeight: '600',
    color: '#333333',
  },
  categoriaSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoriaSelectText: {
    color: '#666666',
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  inputContent: {
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  inputLabel: {
    marginTop: 4,
    marginBottom: 12,
    color: '#666666',
    fontSize: 12,
    fontStyle: 'italic',
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
});
