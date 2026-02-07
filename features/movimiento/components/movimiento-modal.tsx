import { CategoriaModal } from '@/components/categoria-modal';
import { MedioPagoModal } from '@/components/medio-pago-modal';
import {
  DateInputFormField,
  MoneyInputFormField,
  RadioGroupField,
  SelectTriggerField,
  TextInputFormField,
} from '@/common/components';
import { PortalModalForm } from '@/common/forms';
import { Categoria } from '@/features/categoria/interfaces/categoria.interface';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { useInfoInicialPorUsuario } from '@/features/info-inicial/hooks/info-inicial.hook';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';
import { MedioPago } from '@/features/medio-pago/interfaces/medio-pago.interface';
import {
  useMovimientoById,
  useMovimientoForm,
  useUpdateMovimiento,
} from '@/features/movimiento/hooks/movimiento.hook';
import {
  MovimientoRequest,
  TipoMovimientoEnum,
} from '@/features/movimiento/interfaces/movimiento.interface';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

const TIPO_OPCIONES = [
  { value: TipoMovimientoEnum.INGRESO, label: 'Ingreso' },
  { value: TipoMovimientoEnum.EGRESO, label: 'Egreso' },
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
  const medioPagoId = watch('medioPagoId');

  const { data: categorias, fetchCategorias } = useCategorias({ activo: true });
  const { data: mediosPago, fetchMediosPago } = useMediosPago();
  const { data: infoInicial, loading: infoInicialLoading, fetch: fetchInfoInicial } =
    useInfoInicialPorUsuario();

  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimientoEnum>(TipoMovimientoEnum.EGRESO);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedMedioPago, setSelectedMedioPago] = useState<MedioPago | null>(null);
  const [categoriaMenuVisible, setCategoriaMenuVisible] = useState(false);
  const [medioPagoMenuVisible, setMedioPagoMenuVisible] = useState(false);
  const [movimientoCreado, setMovimientoCreado] = useState(false);

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const infoInicialActual = useMemo(() => {
    if (!infoInicial?.length) return null;
    return (
      infoInicial.find((info) => info.mes === currentMonth && info.anio === currentYear) ?? null
    );
  }, [infoInicial, currentMonth, currentYear]);
  const hasInfoInicial = !!infoInicialActual;

  useEffect(() => {
    if (visible && isEditMode && movimientoId) fetchMovimientoById();
  }, [visible, isEditMode, movimientoId]);

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
      setSelectedCategoria(movimientoData.categoria);
      setSelectedMedioPago(movimientoData.medioPago);
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
        setSelectedCategoria(null);
        setSelectedMedioPago(null);
      }
      setCategoriaMenuVisible(false);
      setMedioPagoMenuVisible(false);
      setMovimientoCreado(false);
    } else {
      resetUpdate();
      setSelectedCategoria(null);
      setSelectedMedioPago(null);
    }
  }, [visible, isEditMode]);

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
    if (!infoInicialActual) return;
    const payload: MovimientoRequest = {
      ...formData,
      infoInicialId: infoInicialActual.id,
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
      setMedioPagoMenuVisible(false);
      setMovimientoCreado(false);
      onDismiss();
    }
  };

  const customEmptyState = !hasInfoInicial ? (
    <View style={infoBannerStyle}>
      <MaterialCommunityIcons name="alert-circle" size={48} color="#FF9800" />
      <Text variant="bodyMedium" style={{ marginTop: 12, color: '#666666', textAlign: 'center' }}>
        No hay información inicial disponible para {currentMonth} {currentYear}. Crea una
        información inicial primero.
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

  const topContent = infoInicialActual ? (
    <View style={infoBannerStyle}>
      <View style={infoBannerRow}>
        <MaterialCommunityIcons name="information" size={20} color="#6CB4EE" />
        <Text variant="bodyMedium" style={infoBannerLabel}>
          {currentMonth} {currentYear}
        </Text>
      </View>
    </View>
  ) : null;

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
      initialLoading={infoInicialLoading}
      customEmptyState={customEmptyState}
      topContent={topContent}
      submitDisabled={!hasInfoInicial}
    >
      <Controller
        control={control}
        name="tipoMovimiento"
        render={({ field: { onChange, value } }) => (
          <RadioGroupField
            title="Tipo de Movimiento"
            options={TIPO_OPCIONES}
            value={value}
            onChange={(v) => {
              setTipoMovimiento(v);
              onChange(v);
            }}
            disabled={loading}
          />
        )}
      />

      <DateInputFormField
        control={control}
        name="fecha"
        rules={{ required: 'La fecha es obligatoria' }}
        errors={errors}
        label="Fecha"
        disabled={loading}
      />

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

      <Controller
        control={control}
        name="categoriaId"
        rules={{
          required: 'Debes seleccionar una categoría',
          validate: (v) => v > 0 || 'Debes seleccionar una categoría',
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
              />
            </>
          );
        }}
      />

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

      <Controller
        control={control}
        name="medioPagoId"
        rules={{
          required: 'Debes seleccionar un medio de pago',
          validate: (v) => v > 0 || 'Debes seleccionar un medio de pago',
        }}
        render={({ field: { onChange, value } }) => {
          const currentId = medioPagoId ?? value;
          const medio =
            selectedMedioPago ??
            (isEditMode && currentId > 0 ? mediosPago?.find((m: { id: number }) => m.id === currentId) : undefined);
          return (
            <>
              <SelectTriggerField
                label="Medio de Pago"
                placeholder="Selecciona un medio de pago"
                selectedContent={
                  medio ? (
                    <View style={selectItemRow}>
                      <MaterialCommunityIcons
                        name={medio.tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank'}
                        size={20}
                        color="#6CB4EE"
                        style={selectItemIcon}
                      />
                      <Text variant="bodyMedium" style={{ fontWeight: '500', color: '#333333' }}>
                        {medio.nombre}
                      </Text>
                    </View>
                  ) : undefined
                }
                onPress={() => setMedioPagoMenuVisible(true)}
                error={errors.medioPagoId?.message}
                disabled={loading}
              />
              <MedioPagoModal
                visible={medioPagoMenuVisible}
                onDismiss={() => setMedioPagoMenuVisible(false)}
                onSelect={(m) => {
                  onChange(m.id);
                  setSelectedMedioPago(m);
                }}
                selectedValue={value}
                disabled={loading}
              />
            </>
          );
        }}
      />
    </PortalModalForm>
  );
}
