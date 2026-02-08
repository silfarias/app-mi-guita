import { CategoriaModal } from '@/components/categoria-modal';
import {
  MoneyInputFormField,
  SelectTriggerField,
  TextInputFormField,
} from '@/common/components';
import { PortalModalForm } from '@/common/forms';
import { Categoria } from '@/features/categoria/interfaces/categoria.interface';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import {
  useCreateBulkGastoFijo,
  useGastoFijoById,
  useUpdateGastoFijo,
} from '@/features/gasto-fijo/hooks/gasto-fijo.hook';
import {
  BulkGastoFijoRequest,
  GastoFijoRequest,
  GastoFijoUpdateRequest,
} from '@/features/gasto-fijo/interfaces/gasto-fijo-request.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';

interface GastoFijoItemForm {
  nombre: string;
  montoFijo: number;
  categoriaId: number | null;
}

interface GastoFijoBulkFormValues {
  gastosFijos: GastoFijoItemForm[];
}

const infoBannerStyle = {
  padding: 16,
  backgroundColor: '#E3F2FD',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#BBDEFB',
  marginBottom: 16,
};
const infoBannerRow = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 };
const infoBannerLabel = { flex: 1, color: '#666666', lineHeight: 20 };
const selectItemRow = { flexDirection: 'row' as const, alignItems: 'center' as const, flex: 1 };
const selectItemIcon = { marginRight: 8 };

export interface GastoFijoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
  gastoFijoId?: number | null;
}

export function GastoFijoModal({
  visible,
  onDismiss,
  onSuccess,
  gastoFijoId,
}: GastoFijoModalProps) {
  const isEditMode = gastoFijoId != null;

  const { data: categorias, fetchCategorias } = useCategorias({ activo: true });
  const { data: gastoFijoData, loading: loadingGastoFijo, fetchGastoFijoById } =
    useGastoFijoById(gastoFijoId);
  const { createBulk, loading: creating, error: createError, reset: resetCreate } =
    useCreateBulkGastoFijo();
  const {
    update,
    loading: updating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateGastoFijo();

  const loading = creating || updating || loadingGastoFijo;
  const error = createError || updateError;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<GastoFijoBulkFormValues>({
    defaultValues: {
      gastosFijos: [{ nombre: '', montoFijo: 0, categoriaId: null }],
    },
    mode: 'onSubmit',
  });

  const { fields, prepend, remove, replace } = useFieldArray({
    control,
    name: 'gastosFijos',
  });

  const [categoriaModalVisible, setCategoriaModalVisible] = useState(false);
  const [activeCategoriaIndex, setActiveCategoriaIndex] = useState<number | null>(null);
  const [selectedCategoriaByIndex, setSelectedCategoriaByIndex] = useState<Record<number, Categoria>>({});
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (visible && isEditMode && gastoFijoId) {
      fetchGastoFijoById();
    }
  }, [visible, isEditMode, gastoFijoId]);

  useEffect(() => {
    if (visible) {
      fetchCategorias({ activo: true });
    }
  }, [visible]);

  useEffect(() => {
    if (gastoFijoData && isEditMode && visible) {
      const montoNum =
        gastoFijoData.montoFijo == null || gastoFijoData.montoFijo === ''
          ? 0
          : parseFloat(String(gastoFijoData.montoFijo)) || 0;
      replace([
        {
          nombre: gastoFijoData.nombre,
          montoFijo: montoNum,
          categoriaId: gastoFijoData.categoria.id,
        },
      ]);
      setSelectedCategoriaByIndex({ 0: gastoFijoData.categoria });
      setActivo(gastoFijoData.activo ?? true);
    }
  }, [gastoFijoData, isEditMode, visible, replace]);

  useEffect(() => {
    if (!visible) {
      resetForm({ gastosFijos: [{ nombre: '', montoFijo: 0, categoriaId: null }] });
      setSelectedCategoriaByIndex({});
      setActiveCategoriaIndex(null);
      setCategoriaModalVisible(false);
      setActivo(true);
      resetCreate();
      resetUpdate();
    }
  }, [visible, resetForm, resetCreate, resetUpdate]);

  const handleAgregarGastoFijo = () => {
    setSelectedCategoriaByIndex((prev) => {
      const next: Record<number, Categoria> = {};
      Object.entries(prev).forEach(([k, v]) => {
        next[Number(k) + 1] = v;
      });
      return next;
    });
    prepend({ nombre: '', montoFijo: 0, categoriaId: null });
  };

  const handleCerrarCategoriaModal = () => {
    setCategoriaModalVisible(false);
    setActiveCategoriaIndex(null);
  };

  const onSubmit = async (data: GastoFijoBulkFormValues) => {
    if (isEditMode && gastoFijoId != null) {
      const primerItem = data.gastosFijos[0];
      if (!primerItem?.nombre?.trim() || !primerItem?.categoriaId || primerItem.categoriaId <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Datos incompletos',
          text2: 'El nombre y la categoría son obligatorios',
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }
      try {
        const payload: GastoFijoUpdateRequest = {
          nombre: primerItem.nombre.trim(),
          montoFijo: primerItem.montoFijo ?? 0,
          categoriaId: primerItem.categoriaId,
          activo,
        };
        await update(gastoFijoId, payload);
        Toast.show({
          type: 'success',
          text1: '¡Gasto fijo actualizado!',
          text2: 'El gasto fijo se ha actualizado exitosamente',
          position: 'top',
          visibilityTime: 3000,
        });
        onDismiss();
        onSuccess?.();
      } catch {
        // El error ya se maneja en el hook
      }
      return;
    }

    const gastosFijosFiltrados = data.gastosFijos
      .filter((gf) => gf.nombre.trim() !== '' && gf.categoriaId != null && gf.categoriaId > 0)
      .map((gf) => ({
        nombre: gf.nombre.trim(),
        montoFijo: gf.montoFijo ?? 0,
        categoriaId: gf.categoriaId!,
      }));

    if (gastosFijosFiltrados.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Datos incompletos',
        text2: 'Agrega al menos un gasto fijo con nombre y categoría',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const payload: BulkGastoFijoRequest = { gastosFijos: gastosFijosFiltrados };
      await createBulk(payload);
      Toast.show({
        type: 'success',
        text1: '¡Gastos fijos creados!',
        text2: 'Los gastos fijos se han registrado exitosamente',
        position: 'top',
        visibilityTime: 3000,
      });
      onDismiss();
      onSuccess?.();
    } catch {
      // El error ya se maneja en el hook
    }
  };

  const handleClose = () => {
    if (!loading) {
      onDismiss();
    }
  };

  const topContent = (
    <View style={infoBannerStyle}>
      <View style={infoBannerRow}>
        <MaterialCommunityIcons name="information" size={20} color="#6CB4EE" />
        <Text variant="bodySmall" style={infoBannerLabel}>
          Los gastos fijos son pagos recurrentes que realizas cada mes (ej: alquiler, servicios,
          suscripciones)
        </Text>
      </View>
    </View>
  );

  return (
    <PortalModalForm
      visible={visible}
      onDismiss={handleClose}
      title={isEditMode ? 'Editar Gasto Fijo' : 'Registrar Gastos Fijos'}
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
      error={error ?? undefined}
      submitLabel={
        loading ? (isEditMode ? 'Actualizando...' : 'Guardando...') : isEditMode ? 'Actualizar' : 'Guardar'
      }
      cancelLabel="Cancelar"
      topContent={!isEditMode ? topContent : undefined}
      initialLoading={isEditMode && loadingGastoFijo}
    >
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {isEditMode ? 'Gasto Fijo' : 'Gastos Fijos'}
        </Text>
        {!isEditMode && (
          <TouchableOpacity style={styles.agregarButton} onPress={handleAgregarGastoFijo}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#6CB4EE" />
            <Text variant="bodyMedium" style={styles.agregarButtonText} numberOfLines={1}>
              Agregar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {fields.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="repeat" size={48} color="#CCCCCC" />
          <Text variant="bodyMedium" style={styles.emptyStateText}>
            No hay gastos fijos agregados
          </Text>
          <Text variant="bodySmall" style={styles.emptyStateSubtext}>
            Presiona "Agregar" para agregar un gasto fijo
          </Text>
        </View>
      ) : (
        fields.map((field, index) => (
            <View key={field.id} style={styles.itemCard}>
              {fields.length > 1 && (
                <View style={styles.itemHeader}>
                  <TouchableOpacity
                    onPress={() => remove(index)}
                    style={styles.deleteButton}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}

              <Controller
                control={control}
                name={`gastosFijos.${index}.categoriaId`}
                rules={{
                  required: 'Debes seleccionar una categoría',
                  validate: (v) => (v != null && v > 0) || 'Debes seleccionar una categoría',
                }}
                render={({ field: { onChange, value } }) => {
                  const currentId = value;
                  const categoria =
                    selectedCategoriaByIndex[index] ??
                    (currentId && currentId > 0 ? categorias?.find((c) => c.id === currentId) : undefined);
                  return (
                    <>
                      <SelectTriggerField
                        label="Categoría"
                        placeholder="Seleccionar categoría"
                        selectedContent={
                          categoria ? (
                            <View style={selectItemRow}>
                              <MaterialCommunityIcons
                                name={categoria.icono as any}
                                size={20}
                                color={categoria.color}
                                style={selectItemIcon}
                              />
                              <Text variant="bodyMedium" style={{ color: categoria.color, fontWeight: '500' }}>
                                {categoria.nombre}
                              </Text>
                            </View>
                          ) : undefined
                        }
                        onPress={() => {
                          setActiveCategoriaIndex(index);
                          setCategoriaModalVisible(true);
                        }}
                        error={errors.gastosFijos?.[index]?.categoriaId?.message}
                        disabled={loading}
                      />
                      {activeCategoriaIndex === index && (
                        <CategoriaModal
                          visible={categoriaModalVisible}
                          onDismiss={handleCerrarCategoriaModal}
                          onSelect={(c) => {
                            onChange(c.id);
                            setSelectedCategoriaByIndex((prev) => ({ ...prev, [index]: c }));
                            handleCerrarCategoriaModal();
                          }}
                          selectedValue={value ?? undefined}
                          disabled={loading}
                        />
                      )}
                    </>
                  );
                }}
              />

              <TextInputFormField
                control={control}
                name={`gastosFijos.${index}.nombre`}
                rules={{
                  required: 'El nombre es obligatorio',
                  minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                }}
                errors={errors}
                label="Nombre del gasto fijo"
                placeholder="Ej: Internet/WiFi"
                disabled={loading}
              />

              <MoneyInputFormField
                control={control}
                name={`gastosFijos.${index}.montoFijo`}
                rules={{ min: { value: 0, message: 'El monto no puede ser negativo' } }}
                errors={errors}
                label="Monto fijo"
                placeholder="0.00"
                disabled={loading}
              />
              <Text variant="bodySmall" style={styles.montoHint}>
                Si desconoces el monto o no es fijo, puedes dejarlo en 0 y registrarlo cuando
                realices el pago.
              </Text>
              {isEditMode && index === 0 && (
                <View style={styles.activoRow}>
                  <Text variant="bodyLarge" style={styles.activoLabel}>
                    Activo
                  </Text>
                  <Switch
                    value={activo}
                    onValueChange={setActivo}
                    color="#6CB4EE"
                    disabled={loading}
                  />
                </View>
              )}
            </View>
          ))
      )}

    </PortalModalForm>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
  },
  agregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginBottom: 16,
  },
  emptyStateText: {
    marginTop: 16,
    color: '#666666',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    color: '#999999',
    textAlign: 'center',
  },
  itemCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 0,
    gap: 12,
  },
  categoriaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemHeaderInfo: {
    flex: 1,
  },
  categoriaNombre: {
    fontWeight: '600',
    color: '#333333',
  },
  categoriaTrigger: {
    marginTop: 5,
  },
  categoriaChangeButton: {
    marginBottom: 12,
  },
  categoriaChangeText: {
    color: '#6CB4EE',
  },
  deleteButton: {
    padding: 4,
  },
  montoHint: {
    marginLeft: 3,
    marginTop: 4,
    color: '#666666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  activoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  activoLabel: {
    color: '#333333',
    fontWeight: '500',
  },
});