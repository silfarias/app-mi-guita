import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuthStore } from '../../../store/auth.store';
import { MovimientoRequest, MovimientoResponse, TipoMovimientoEnum } from '../interfaces/movimiento.interface';
import { MovimientoService } from '../services/movimiento.service';
import { useAsyncRun } from '../../../hooks/use-async-run';

const movimientoService = new MovimientoService();

/**
 * Hook para crear un nuevo movimiento (ingreso o egreso).
 * Maneja la creación de movimientos y retorna el movimiento creado.
 */
export function useMovimientoForm() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<MovimientoResponse | null>(null);

  const { control, handleSubmit, formState: { errors }, reset: resetForm } = useForm<MovimientoRequest>({
    defaultValues: {
      infoInicialId: 0,
      fecha: new Date().toISOString().split('T')[0],
      tipoMovimiento: TipoMovimientoEnum.EGRESO,
      descripcion: '',
      categoriaId: 0,
      monto: 0,
      medioPagoId: 0,
    },
  });

  const create = async (request: MovimientoRequest) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await movimientoService.create(accessToken, request);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al crear el movimiento', logLabel: 'movimiento.create' }
    );
  };

  const onSubmit = async (formData: MovimientoRequest) => {
    await create(formData);
  };

  const reset = () => {
    setData(null);
    setError(null);
    resetForm();
  };

  return {
    data,
    loading,
    error,
    create,
    control,
    handleSubmit,
    errors,
    onSubmit,
    reset,
  };
}