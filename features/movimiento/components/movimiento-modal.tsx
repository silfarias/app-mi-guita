import {
  DateInputFormField,
  MoneyInputFormField,
  RadioGroupField,
  SelectTriggerField,
  TextInputFormField,
} from '@/common/components';
import { PortalModalForm } from '@/common/forms';
import { CategoriaModal } from '@/features/categoria/components/categoria-modal';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { Categoria, TipoCategoriaEnum } from '@/features/categoria/interfaces/categoria.interface';
import { useCuentas } from '@/features/cuenta/hooks/cuenta.hook';
import { CuentaItemResponse } from '@/features/cuenta/interfaces/cuenta.interface';
import { CuentaSelectorModal } from '@/features/cuenta/components/cuenta-selector-modal';
import {
  useMovimientoById,
  useMovimientoForm,
  useUpdateMovimiento,
} from '@/features/movimiento/hooks/movimiento.hook';
import {
  MovimientoRequest,
  TipoMovimientoEnum,
} from '@/features/movimiento/interfaces/movimiento.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';

const TIPO_OPCIONES = [
  { value: TipoMovimientoEnum.INGRESO, label: 'Ingreso' },
  { value: TipoMovimientoEnum.EGRESO, label: 'Egreso' }
];

const infoBannerStyle = {
  padding: 16,
  backgroundColor: '#F5F5F5',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E0E0E0',
};
const infoBannerRow = { flexDirection: 'row' as const, alignItems: 'center' as const };
const infoBannerLabel = { marginLeft: 8, fontWeight: '600' as const, color: '#333333' };
const selectItemRow = { flexDirection: 'row' as const, alignItems: 'center' as const, flex: 1 };
const selectItemIcon = { marginRight: 8 };

const styles = StyleSheet.create({
  fieldSpacing: { marginBottom: 8 },
});

export interface MovimientoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
  movimientoId?: number | null;
}

export function MovimientoModal({
  visible,
  onDismiss,
  onSuccess,
  movimientoId,
}: MovimientoModalProps) {
  const isEditMode = movimientoId != null;
  const { data: movimientoData, loading: loadingMovimiento, fetchMovimientoById } =
    useMovimientoById(movimientoId);
  const {
    update,
    loading: updating,
    error: updateError,
    data: updateData,
    reset: resetUpdate,
  } = useUpdateMovimiento();
  const {
    control,
    handleSubmit,
    errors,
    onSubmit,
    loading: creating,
    error: createError,
    data,
    reset,
    setValue,
    watch,
  } = useMovimientoForm();

  const loading = creating || updating || loadingMovimiento;
  const error = createError || updateError;
  const categoriaId = watch('categoriaId');
  const cuentaId = watch('cuentaId');

  const { data: categorias, fetchCategorias } = useCategorias({ activo: true });
  /** Cuentas del usuario (GET /cuenta/list); se cargan al abrir el modal. */
  const { data: cuentas, loading: cuentasLoading, fetch: fetchCuentas } = useCuentas();

  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimientoEnum>(TipoMovimientoEnum.EGRESO);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaItemResponse | null>(null);
  const [categoriaMenuVisible, setCategoriaMenuVisible] = useState(false);
  const [cuentaMenuVisible, setCuentaMenuVisible] = useState(false);
  const [movimientoCreado, setMovimientoCreado] = useState(false);

  const hasCuentas = cuentas && cuentas.length > 0;

  /** Edición de movimiento tipo Saldo inicial: solo se puede cambiar el monto (y la fecha). */
  const isSaldoInicial = isEditMode && movimientoData?.tipoMovimiento === TipoMovimientoEnum.SALDO_INICIAL;

  useEffect(() => {
    if (visible && isEditMode && movimientoId) fetchMovimientoById();
  }, [visible, isEditMode, movimientoId]);

  useEffect(() => {
    if (movimientoData && isEditMode && visible) {
      const tipo = movimientoData.tipoMovimiento === TipoMovimientoEnum.TRANSFERENCIA
        ? TipoMovimientoEnum.EGRESO
        : movimientoData.tipoMovimiento;
      setValue('cuentaId', movimientoData.cuenta.id);
      setValue('fecha', movimientoData.fecha);
      setValue('tipoMovimiento', tipo);
      setValue('descripcion', movimientoData.descripcion);
      setValue('categoriaId', movimientoData.categoria?.id ?? 0);
      setValue('monto', parseFloat(movimientoData.monto.toString()));
      setTipoMovimiento(tipo);
      setSelectedCategoria(movimientoData.categoria ?? null);
      setSelectedCuenta(movimientoData.cuenta);
    }
  }, [movimientoData, isEditMode, visible, setValue]);

  useEffect(() => {
    if (visible) {
      fetchCuentas();
      fetchCategorias({ activo: true });
      if (!isEditMode) {
        reset();
        setValue('tipoMovimiento', TipoMovimientoEnum.EGRESO);
        setValue('fecha', new Date().toISOString().split('T')[0]);
        setTipoMovimiento(TipoMovimientoEnum.EGRESO);
        setSelectedCategoria(null);
        setSelectedCuenta(null);
        if (cuentas?.length === 1) {
          setValue('cuentaId', cuentas[0].id);
          setSelectedCuenta(cuentas[0]);
        }
      }
      setCategoriaMenuVisible(false);
      setCuentaMenuVisible(false);
      setMovimientoCreado(false);
    } else {
      resetUpdate();
      setSelectedCategoria(null);
      setSelectedCuenta(null);
    }
  }, [visible, isEditMode]);

  useEffect(() => {
    if (visible && !isEditMode && cuentas?.length === 1 && !selectedCuenta) {
      setValue('cuentaId', cuentas[0].id);
      setSelectedCuenta(cuentas[0]);
    }
  }, [visible, isEditMode, cuentas, selectedCuenta, setValue]);

  useEffect(() => {
    if (visible && !isEditMode && movimientoCreado && data && !loading && !error) {
      Toast.show({
        type: 'success',
        text1: '¡Movimiento creado!',
        text2: 'El movimiento se ha registrado exitosamente',
        position: 'top',
        visibilityTime: 3000,
      });
      const t = setTimeout(() => {
        onDismiss();
        onSuccess?.();
        setMovimientoCreado(false);
      }, 300);
      return () => clearTimeout(t);
    }
    if (
      visible &&
      isEditMode &&
      movimientoCreado &&
      updateData &&
      !updating &&
      !loading &&
      !updateError
    ) {
      Toast.show({
        type: 'success',
        text1: '¡Movimiento actualizado!',
        text2: 'El movimiento se ha actualizado exitosamente',
        position: 'top',
        visibilityTime: 3000,
      });
      const t = setTimeout(() => {
        onDismiss();
        onSuccess?.();
        setMovimientoCreado(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [visible, isEditMode, movimientoCreado, data, updateData, loading, error, updateError, updating]);

  const handleFormSubmit = async (formData: MovimientoRequest) => {
    if (!formData.cuentaId) return;
    const payload: MovimientoRequest = {
      ...formData,
      cuentaId: formData.cuentaId,
      tipoMovimiento,
      fecha: formData.fecha || new Date().toISOString().split('T')[0],
    };
    setMovimientoCreado(true);
    if (isEditMode && movimientoId) {
      await update(movimientoId, payload);
    } else {
      await onSubmit(payload);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setCategoriaMenuVisible(false);
      setCuentaMenuVisible(false);
      setMovimientoCreado(false);
      onDismiss();
    }
  };

  const customEmptyState = !hasCuentas ? (
    <View style={infoBannerStyle}>
      <MaterialCommunityIcons name="alert-circle" size={48} color="#FF9800" />
      <Text variant="bodyMedium" style={{ marginTop: 12, color: '#666666', textAlign: 'center' }}>
        No tenés cuentas cargadas. Agregá al menos una cuenta en el inicio para poder registrar movimientos.
      </Text>
      <Button
        mode="contained"
        onPress={handleClose}
        style={{ marginTop: 16, borderRadius: 12 }}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{ fontSize: 16, fontWeight: '600' }}
      >
        Cerrar
      </Button>
    </View>
  ) : undefined;

  const topContent = null;

  return (
    <PortalModalForm
      visible={visible}
      onDismiss={handleClose}
      title={isEditMode ? 'Editar Movimiento' : 'Crear Movimiento'}
      onSubmit={handleSubmit(handleFormSubmit)}
      loading={loading}
      error={error ?? undefined}
      submitLabel={loading ? (isEditMode ? 'Actualizando...' : 'Creando...') : isEditMode ? 'Actualizar' : 'Guardar'}
      cancelLabel="Cancelar"
      initialLoading={cuentasLoading}
      customEmptyState={customEmptyState}
      topContent={topContent}
      submitDisabled={!hasCuentas}
    >
      {/* 1. Tipo de movimiento */}
      <View style={styles.fieldSpacing}>
      {isSaldoInicial ? (
        <View style={infoBannerStyle}>
          <Text variant="labelLarge" style={{ color: '#666666', marginBottom: 4 }}>Tipo de movimiento</Text>
          <View style={infoBannerRow}>
            <MaterialCommunityIcons name="bank-check" size={20} color="#6CB4EE" />
            <Text variant="bodyLarge" style={infoBannerLabel}>Saldo inicial</Text>
          </View>
        </View>
      ) : (
      <Controller
        control={control}
        name="tipoMovimiento"
        render={({ field: { onChange, value } }) => (
          <RadioGroupField
            title="Tipo de movimiento"
            options={TIPO_OPCIONES}
            value={value}
            onChange={(v) => {
              setTipoMovimiento(v);
              onChange(v);
              setValue('categoriaId', 0);
              setSelectedCategoria(null);
            }}
            disabled={loading}
          />
        )}
      />
      )}
      </View>

      {/* 2. Categoría (oculta para saldo inicial) */}
      {!isSaldoInicial && (
      <View style={styles.fieldSpacing}>
      <Controller
        control={control}
        name="categoriaId"
        rules={{
          validate: (v) =>
            v > 0 || (isEditMode && movimientoData && !movimientoData.categoria) || 'Debes seleccionar una categoría',
        }}
        render={({ field: { onChange, value } }) => {
          const currentId = categoriaId ?? value;
          const categoria =
            selectedCategoria ??
            (isEditMode && currentId > 0 ? categorias?.find((c) => c.id === currentId) : undefined);
          return (
            <>
              <SelectTriggerField
                label="Categoría"
                placeholder="Selecciona una categoría"
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
                onPress={() => setCategoriaMenuVisible(true)}
                error={errors.categoriaId?.message}
                disabled={loading}
              />
              <CategoriaModal
                visible={categoriaMenuVisible}
                onDismiss={() => setCategoriaMenuVisible(false)}
                onSelect={(c) => {
                  onChange(c.id);
                  setSelectedCategoria(c);
                }}
                selectedValue={value}
                disabled={loading}
                tipoMovimiento={tipoMovimiento as unknown as TipoCategoriaEnum}
              />
            </>
          );
        }}
      />
      </View>
      )}

      {/* 3. Cuenta (solo lectura en saldo inicial) */}
      <View style={styles.fieldSpacing}>
      <Controller
        control={control}
        name="cuentaId"
        rules={{
          required: 'Debes seleccionar una cuenta',
          validate: (v) => v > 0 || 'Debes seleccionar una cuenta',
        }}
        render={({ field: { onChange, value } }) => {
          const currentId = cuentaId ?? value;
          const cuenta =
            selectedCuenta ??
            (cuentas?.find((c) => c.id === currentId) ?? null);
          return (
            <>
              {isSaldoInicial && cuenta ? (
                <View style={infoBannerStyle}>
                  <Text variant="labelLarge" style={{ color: '#666666', marginBottom: 4 }}>Cuenta</Text>
                  <View style={infoBannerRow}>
                    <MaterialCommunityIcons name="wallet" size={20} color="#6CB4EE" />
                    <Text variant="bodyLarge" style={infoBannerLabel}>
                      {cuenta.nombre} - ${Number(cuenta.saldoActual).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              ) : (
                <>
              <SelectTriggerField
                label="Cuenta"
                placeholder="Selecciona una cuenta"
                selectedContent={
                  cuenta ? (
                    <View style={selectItemRow}>
                      <MaterialCommunityIcons name="wallet" size={20} color="#6CB4EE" style={selectItemIcon} />
                      <Text variant="bodyMedium" style={{ fontWeight: '500', color: '#333333' }}>
                        {cuenta.nombre} - ${Number(cuenta.saldoActual).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  ) : undefined
                }
                onPress={() => setCuentaMenuVisible(true)}
                error={errors.cuentaId?.message}
                disabled={loading}
              />
              <CuentaSelectorModal
                visible={cuentaMenuVisible}
                onDismiss={() => setCuentaMenuVisible(false)}
                onSelect={(c) => {
                  onChange(c.id);
                  setSelectedCuenta(c);
                }}
                selectedValue={value}
                disabled={loading}
              />
                </>
              )}
            </>
          );
        }}
      />
      </View>

      {/* 4. Fecha (editable siempre) */}
      <View style={styles.fieldSpacing}>
      <DateInputFormField
        control={control}
        name="fecha"
        errors={errors}
        label="Fecha (opcional)"
        disabled={loading}
      />
      </View>

      {/* 5. Descripción (solo lectura en saldo inicial) */}
      {isSaldoInicial ? (
        <View style={styles.fieldSpacing}>
        <View style={infoBannerStyle}>
          <Text variant="labelLarge" style={{ color: '#666666', marginBottom: 4 }}>Descripción</Text>
          <Text variant="bodyLarge" style={{ marginLeft: 0, color: '#333333' }}>
            {watch('descripcion')}
          </Text>
        </View>
        </View>
      ) : (
      <View style={styles.fieldSpacing}>
      <TextInputFormField
        control={control}
        name="descripcion"
        rules={{
          required: 'La descripción es obligatoria',
          minLength: { value: 3, message: 'La descripción debe tener al menos 3 caracteres' },
        }}
        errors={errors}
        label="Descripción"
        placeholder="Ej: Compra en supermercado"
        multiline
        numberOfLines={3}
        disabled={loading}
      />
      </View>
      )}

      {/* 6. Monto */}
      <View style={styles.fieldSpacing}>
      <MoneyInputFormField
        control={control}
        name="monto"
        rules={{
          required: 'El monto es obligatorio',
          min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
        }}
        errors={errors}
        label="Monto"
        placeholder="0.00"
        disabled={loading}
      />
      </View>
    </PortalModalForm>
  );
}