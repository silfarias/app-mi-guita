import { PortalModalForm } from '@/common/forms';
import { MoneyInputFormField, TextInputFormField } from '@/common/components';
import { useForm } from 'react-hook-form';
import { CuentaRequest, TipoCuentaEnum } from '../interfaces/cuenta.interface';
import { useAuthStore } from '@/store/auth.store';
import { CuentaService } from '../services/cuenta.service';
import { useAsyncRun } from '@/hooks/use-async-run';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Text, TouchableOpacity } from 'react-native-paper';
import Toast from 'react-native-toast-message';

const cuentaService = new CuentaService();

const TIPOS: { value: TipoCuentaEnum; label: string }[] = [
  { value: TipoCuentaEnum.EFECTIVO, label: 'Efectivo' },
  { value: TipoCuentaEnum.BANCO, label: 'Banco' },
  { value: TipoCuentaEnum.BILLETERA, label: 'Billetera virtual' },
];

export interface CuentaModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
}

export function CuentaModal({ visible, onDismiss, onSuccess }: CuentaModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [tipoMenuVisible, setTipoMenuVisible] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CuentaRequest>({
    defaultValues: {
      nombre: '',
      tipo: TipoCuentaEnum.EFECTIVO,
      saldoInicial: 0,
    },
  });

  const tipo = watch('tipo');

  useEffect(() => {
    if (visible) {
      reset({
        nombre: '',
        tipo: TipoCuentaEnum.EFECTIVO,
        saldoInicial: 0,
      });
    }
  }, [visible, reset]);

  const onSubmit = async (data: CuentaRequest) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    const nombreTrim = data.nombre.trim();
    if (!nombreTrim) {
      setError('El nombre es obligatorio');
      return;
    }
    setError(null);
    await run(
      async () => {
        await cuentaService.createBulk(accessToken, {
          cuentas: [
            {
              nombre: nombreTrim,
              tipo: data.tipo,
              saldoInicial: Number(data.saldoInicial) || 0,
            },
          ],
        });
        Toast.show({
          type: 'success',
          text1: 'Cuenta creada',
          text2: 'La cuenta se agregó correctamente',
          position: 'top',
          visibilityTime: 2500,
        });
        onDismiss();
        onSuccess?.();
      },
      {
        errorFallback: 'Error al crear la cuenta',
        logLabel: 'cuenta.create',
      }
    );
  };

  const tipoLabel = TIPOS.find((t) => t.value === tipo)?.label ?? 'Efectivo';

  return (
    <PortalModalForm
      visible={visible}
      onDismiss={onDismiss}
      title="Agregar cuenta"
      onSubmit={handleSubmit(onSubmit)}
      loading={loading}
      error={error ?? undefined}
      submitLabel="Guardar"
      cancelLabel="Cancelar"
      submitButtonColor="#4DA6FF"
    >
      <TextInputFormField
        control={control}
        name="nombre"
        label="Nombre"
        placeholder="Ej: Efectivo, Mercado Pago, Banco..."
        rules={{
          required: 'El nombre es obligatorio',
          minLength: { value: 2, message: 'Al menos 2 caracteres' },
        }}
        errors={errors}
        disabled={loading}
      />

      <View style={styles.field}>
        <Text variant="bodyMedium" style={styles.label}>
          Tipo
        </Text>
        <Menu
          visible={tipoMenuVisible}
          onDismiss={() => setTipoMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={() => setTipoMenuVisible(true)}
              disabled={loading}
            >
              <Text variant="bodyMedium">{tipoLabel}</Text>
              <Text variant="bodySmall" style={styles.chevron}>▼</Text>
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          {TIPOS.map((t) => (
            <Menu.Item
              key={t.value}
              onPress={() => {
                setValue('tipo', t.value);
                setTipoMenuVisible(false);
              }}
              title={t.label}
            />
          ))}
        </Menu>
      </View>

      <MoneyInputFormField
        control={control}
        name="saldoInicial"
        label="Saldo inicial (opcional)"
        placeholder="0"
        rules={{
          setValueAs: (v) => (v === '' || v == null ? 0 : Number(v)),
        }}
        errors={errors}
        disabled={loading}
      />
    </PortalModalForm>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#666666',
    fontWeight: '500',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  chevron: {
    color: '#666666',
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
  },
});
