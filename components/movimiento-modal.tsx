import { CategoriaModal } from '@/components/categoria-modal';
import { MedioPagoModal } from '@/components/medio-pago-modal';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';
import { TipoMovimientoEnum } from '@/features/movimiento/interfaces/movimiento.interface';
import { useMovimientoForm, useMovimientoById, useUpdateMovimiento } from '@/features/movimiento/hooks/movimiento.hook';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Portal, RadioButton, Text, TextInput } from 'react-native-paper';

interface MovimientoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
  movimientoId?: number | null;
}

export function MovimientoModal({ visible, onDismiss, onSuccess, movimientoId }: MovimientoModalProps) {
  const isEditMode = movimientoId != null;
  const { data: movimientoData, loading: loadingMovimiento, fetchMovimientoById } = useMovimientoById(movimientoId);
  const { update, loading: updating, error: updateError, data: updateData, reset: resetUpdate } = useUpdateMovimiento();
  const {
    control,
    handleSubmit,
    errors,
    onSubmit,
    loading: creating,
    error: createError,
    data,
    reset,
    watch,
    setValue,
  } = useMovimientoForm();
  
  const loading = creating || updating || loadingMovimiento;
  const error = createError || updateError;
  
  // Observar cambios en los valores del formulario para forzar re-render
  const categoriaId = watch('categoriaId');
  const medioPagoId = watch('medioPagoId');

  const { data: categorias, fetchCategorias } = useCategorias({ activo: true });
  const { data: mediosPago, fetchMediosPago } = useMediosPago();
  const { data: infoInicial, loading: infoInicialLoading, fetch: fetchInfoInicial } = useInfoInicialPorUsuario();

  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimientoEnum>(TipoMovimientoEnum.EGRESO);
  const [categoriaMenuVisible, setCategoriaMenuVisible] = useState(false);
  const [medioPagoMenuVisible, setMedioPagoMenuVisible] = useState(false);
  const [movimientoCreado, setMovimientoCreado] = useState(false);

  // Cargar datos del movimiento si está en modo edición
  useEffect(() => {
    if (visible && isEditMode && movimientoId) {
      fetchMovimientoById();
    }
  }, [visible, isEditMode, movimientoId]);

  // Cargar datos en el formulario cuando se obtiene el movimiento
  useEffect(() => {
    if (movimientoData && isEditMode && visible) {
      setValue('infoInicialId', movimientoData.infoInicial.id);
      setValue('fecha', movimientoData.fecha);
      setValue('tipoMovimiento', movimientoData.tipoMovimiento);
      setValue('descripcion', movimientoData.descripcion);
      setValue('categoriaId', movimientoData.categoria.id);
      setValue('monto', parseFloat(movimientoData.monto.toString()));
      setValue('medioPagoId', movimientoData.medioPago.id);
      setTipoMovimiento(movimientoData.tipoMovimiento);
    }
  }, [movimientoData, isEditMode, visible, setValue]);

  useEffect(() => {
    if (visible) {
      fetchInfoInicial();
      fetchCategorias({ activo: true });
      fetchMediosPago();
      if (!isEditMode) {
        reset();
        setTipoMovimiento(TipoMovimientoEnum.EGRESO);
      }
      setCategoriaMenuVisible(false);
      setMedioPagoMenuVisible(false);
      setMovimientoCreado(false);
    } else {
      resetUpdate();
    }
  }, [visible, isEditMode]);

  // Cerrar modal cuando se crea o actualiza exitosamente el movimiento
  useEffect(() => {
    // Para creación
    if (visible && !isEditMode && movimientoCreado && data && !loading && !error) {
      Toast.show({
        type: 'success',
        text1: '¡Movimiento creado!',
        text2: 'El movimiento se ha registrado exitosamente',
        position: 'top',
        visibilityTime: 3000,
      });

      const timer = setTimeout(() => {
        onDismiss();
        if (onSuccess) {
          onSuccess();
        }
        setMovimientoCreado(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Para actualización
    if (visible && isEditMode && movimientoCreado && updateData && !updating && !loading && !updateError) {
      Toast.show({
        type: 'success',
        text1: '¡Movimiento actualizado!',
        text2: 'El movimiento se ha actualizado exitosamente',
        position: 'top',
        visibilityTime: 3000,
      });

      const timer = setTimeout(() => {
        onDismiss();
        if (onSuccess) {
          onSuccess();
        }
        setMovimientoCreado(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [visible, isEditMode, movimientoCreado, data, updateData, loading, error, updateError, updating]);

  const handleFormSubmit = async (formData: any) => {
    // Usar la info inicial del mes actual
    if (!infoInicialActual) {
      return;
    }

    const movimientoData = {
      ...formData,
      infoInicialId: infoInicialActual.id,
      tipoMovimiento,
      fecha: formData.fecha || new Date().toISOString().split('T')[0],
    };

    setMovimientoCreado(true);
    
    if (isEditMode && movimientoId) {
      await update(movimientoId, movimientoData);
    } else {
      await onSubmit(movimientoData);
    }
  };

  // Obtener la info inicial del mes actual
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  
  const infoInicialActual = useMemo(() => {
    if (!infoInicial || infoInicial.length === 0) return null;
    return infoInicial.find(
      (info) => info.mes === currentMonth && info.anio === currentYear
    ) || null;
  }, [infoInicial, currentMonth, currentYear]);

  // Verificar si hay info inicial disponible para el mes actual
  const hasInfoInicial = !!infoInicialActual;

  const handleClose = () => {
    if (!loading) {
      reset();
      setCategoriaMenuVisible(false);
      setMedioPagoMenuVisible(false);
      setMovimientoCreado(false);
      onDismiss();
    }
  };

  // Solo mostrar loading inicial cuando se está cargando la info inicial
  const isLoading = infoInicialLoading;

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalWrapper}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
            disabled={loading || isLoading}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.title}>
                {isEditMode ? 'Editar Movimiento' : 'Crear Movimiento'}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                disabled={loading}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="window-close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6CB4EE" />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Cargando datos...
                </Text>
              </View>
            ) : !hasInfoInicial ? (
              <View style={styles.loadingContainer}>
                <MaterialCommunityIcons name="alert-circle" size={48} color="#FF9800" />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  No hay información inicial disponible para {currentMonth} {currentYear}. Por favor, crea una información inicial primero.
                </Text>
                <Button
                  mode="contained"
                  onPress={handleClose}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Cerrar
                </Button>
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Información Inicial del Mes Actual */}
                {infoInicialActual && (
                  <View style={styles.infoInicialContainer}>
                    <View style={styles.infoInicialHeader}>
                      <MaterialCommunityIcons name="information" size={20} color="#6CB4EE" />
                      <Text variant="bodyMedium" style={styles.infoInicialLabel}>
                        {currentMonth} {currentYear}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Tipo de Movimiento */}
                <View style={styles.section}>
                  <Text variant="bodyLarge" style={styles.sectionTitle}>
                    Tipo de Movimiento
                  </Text>
                  <Controller
                    control={control}
                    name="tipoMovimiento"
                    render={({ field: { onChange } }) => (
                      <RadioButton.Group
                        onValueChange={(value) => {
                          setTipoMovimiento(value as TipoMovimientoEnum);
                          onChange(value);
                        }}
                        value={tipoMovimiento}
                      >
                        <View style={styles.radioRow}>
                          <View style={styles.radioOption}>
                            <RadioButton
                              value={TipoMovimientoEnum.INGRESO}
                              color="#6CB4EE"
                              disabled={loading}
                            />
                            <Text variant="bodyMedium" style={styles.radioLabel}>
                              Ingreso
                            </Text>
                          </View>
                          <View style={styles.radioOption}>
                            <RadioButton
                              value={TipoMovimientoEnum.EGRESO}
                              color="#6CB4EE"
                              disabled={loading}
                            />
                            <Text variant="bodyMedium" style={styles.radioLabel}>
                              Egreso
                            </Text>
                          </View>
                        </View>
                      </RadioButton.Group>
                    )}
                  />
                </View>

                {/* Fecha */}
                <Controller
                  control={control}
                  name="fecha"
                  rules={{
                    required: 'La fecha es obligatoria',
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Fecha"
                      placeholder="YYYY-MM-DD"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      disabled={loading}
                      error={!!errors.fecha}
                      style={styles.input}
                      contentStyle={styles.inputContent}
                      outlineStyle={styles.inputOutline}
                    />
                  )}
                />
                {errors.fecha && (
                  <Text variant="bodySmall" style={styles.fieldError}>
                    {errors.fecha.message}
                  </Text>
                )}

                {/* Descripción */}
                <Controller
                  control={control}
                  name="descripcion"
                  rules={{
                    required: 'La descripción es obligatoria',
                    minLength: {
                      value: 3,
                      message: 'La descripción debe tener al menos 3 caracteres',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Descripción"
                      placeholder="Ej: Compra en supermercado"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                      disabled={loading}
                      error={!!errors.descripcion}
                      style={styles.input}
                      contentStyle={styles.inputContent}
                      outlineStyle={styles.inputOutline}
                    />
                  )}
                />
                {errors.descripcion && (
                  <Text variant="bodySmall" style={styles.fieldError}>
                    {errors.descripcion.message}
                  </Text>
                )}

                {/* Categoría */}
                <Controller
                  control={control}
                  name="categoriaId"
                  rules={{
                    required: 'Debes seleccionar una categoría',
                    validate: (value) => value > 0 || 'Debes seleccionar una categoría',
                  }}
                  render={({ field: { onChange, value } }) => {
                    // Usar el valor observado para asegurar re-render cuando cambie
                    const currentValue = categoriaId !== undefined ? categoriaId : value;
                    const categoriaSeleccionada = currentValue > 0 
                      ? categorias.find((cat) => cat.id === currentValue)
                      : undefined;
                    return (
                      <View>
                        <Text variant="bodyMedium" style={styles.selectLabel}>
                          Categoría *
                        </Text>
                        <TouchableOpacity
                          onPress={() => setCategoriaMenuVisible(true)}
                          disabled={loading}
                          style={[
                            styles.selectInput,
                            errors.categoriaId && styles.selectInputError,
                          ]}
                        >
                          <View style={styles.selectInputContent}>
                            {categoriaSeleccionada ? (
                              <View style={styles.selectItemContent}>
                                <MaterialCommunityIcons
                                  name={categoriaSeleccionada.icono as any}
                                  size={20}
                                  color={categoriaSeleccionada.color}
                                  style={styles.selectItemIcon}
                                />
                                <Text
                                  variant="bodyMedium"
                                  style={[styles.selectItemText, { color: categoriaSeleccionada.color }]}
                                >
                                  {categoriaSeleccionada.nombre}
                                </Text>
                              </View>
                            ) : (
                              <Text variant="bodyMedium" style={styles.selectPlaceholder}>
                                Selecciona una categoría
                              </Text>
                            )}
                            <MaterialCommunityIcons
                              name="chevron-down"
                              size={20}
                              color="#666666"
                            />
                          </View>
                        </TouchableOpacity>
                        
                        {/* Modal para seleccionar categoría */}
                        <CategoriaModal
                          visible={categoriaMenuVisible}
                          onDismiss={() => setCategoriaMenuVisible(false)}
                          onSelect={onChange}
                          selectedValue={value}
                          disabled={loading}
                        />
                      </View>
                    );
                  }}
                />
                {errors.categoriaId && (
                  <Text variant="bodySmall" style={styles.fieldError}>
                    {errors.categoriaId.message}
                  </Text>
                )}

                {/* Monto */}
                <Controller
                  control={control}
                  name="monto"
                  rules={{
                    required: 'El monto es obligatorio',
                    min: {
                      value: 0.01,
                      message: 'El monto debe ser mayor a 0',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Monto"
                      placeholder="0.00"
                      value={value?.toString() || ''}
                      onChangeText={(text) => {
                        const numValue = parseFloat(text) || 0;
                        onChange(numValue);
                      }}
                      onBlur={onBlur}
                      mode="outlined"
                      keyboardType="numeric"
                      disabled={loading}
                      error={!!errors.monto}
                      style={styles.input}
                      contentStyle={styles.inputContent}
                      outlineStyle={styles.inputOutline}
                      left={<TextInput.Icon icon="currency-usd" />}
                    />
                  )}
                />
                {errors.monto && (
                  <Text variant="bodySmall" style={styles.fieldError}>
                    {errors.monto.message}
                  </Text>
                )}

                {/* Medio de Pago */}
                <Controller
                  control={control}
                  name="medioPagoId"
                  rules={{
                    required: 'Debes seleccionar un medio de pago',
                    validate: (value) => value > 0 || 'Debes seleccionar un medio de pago',
                  }}
                  render={({ field: { onChange, value } }) => {
                    // Usar el valor observado para asegurar re-render cuando cambie
                    const currentValue = medioPagoId !== undefined ? medioPagoId : value;
                    const medioSeleccionado = currentValue > 0
                      ? mediosPago.find((medio: { id: number }) => medio.id === currentValue)
                      : undefined;
                    
                    return (
                      <View>
                        <Text variant="bodyMedium" style={styles.selectLabel}>
                          Medio de Pago *
                        </Text>
                        <TouchableOpacity
                          onPress={() => setMedioPagoMenuVisible(true)}
                          disabled={loading}
                          style={[
                            styles.selectInput,
                            errors.medioPagoId && styles.selectInputError,
                          ]}
                        >
                          <View style={styles.selectInputContent}>
                            {medioSeleccionado ? (
                              <View style={styles.selectItemContent}>
                                <MaterialCommunityIcons
                                  name={medioSeleccionado.tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank'}
                                  size={20}
                                  color="#6CB4EE"
                                  style={styles.selectItemIcon}
                                />
                                <Text variant="bodyMedium" style={styles.selectItemText}>
                                  {medioSeleccionado.nombre}
                                </Text>
                              </View>
                            ) : (
                              <Text variant="bodyMedium" style={styles.selectPlaceholder}>
                                Selecciona un medio de pago
                              </Text>
                            )}
                            <MaterialCommunityIcons
                              name="chevron-down"
                              size={20}
                              color="#666666"
                            />
                          </View>
                        </TouchableOpacity>
                        
                        {/* Modal para seleccionar medio de pago */}
                        <MedioPagoModal
                          visible={medioPagoMenuVisible}
                          onDismiss={() => setMedioPagoMenuVisible(false)}
                          onSelect={onChange}
                          selectedValue={value}
                          disabled={loading}
                        />
                      </View>
                    );
                  }}
                />
                {errors.medioPagoId && (
                  <Text variant="bodySmall" style={styles.fieldError}>
                    {errors.medioPagoId.message}
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

                {/* Botones */}
                <View style={styles.buttonContainer}>
                  <Button
                    mode="outlined"
                    onPress={handleClose}
                    disabled={loading}
                    style={[styles.button, styles.cancelButton]}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSubmit(handleFormSubmit)}
                    disabled={loading || isLoading || !hasInfoInicial}
                    loading={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    {loading ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar' : 'Guardar')}
                  </Button>
                </View>
              </ScrollView>
            )}
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    width: '100%',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoInicialContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoInicialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoInicialLabel: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#333333',
  },
  infoInicialValue: {
    paddingLeft: 28,
  },
  infoInicialText: {
    color: '#666666',
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    marginLeft: 8,
    color: '#333333',
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
  selectLabel: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  selectInput: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    minHeight: 56,
    justifyContent: 'center',
  },
  selectInputError: {
    borderColor: '#C62828',
  },
  selectInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectItemIcon: {
    marginRight: 8,
  },
  selectItemText: {
    color: '#333333',
    fontWeight: '500',
  },
  selectPlaceholder: {
    color: '#999999',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 8,
  },
  menuItemText: {
    color: '#333333',
  },
  fieldError: {
    color: '#C62828',
    marginTop: -16,
    marginBottom: 12,
    marginLeft: 4,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  cancelButton: {
    borderColor: '#E0E0E0',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});