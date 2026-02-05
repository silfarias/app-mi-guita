import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuthStore } from '../../../store/auth.store';
import { MovimientoRequest, MovimientoResponse, MovimientoSearchResponse, MovimientosPorInfoSearchResponse, TipoMovimientoEnum } from '../interfaces/movimiento.interface';
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

  const { control, handleSubmit, formState: { errors }, reset: resetForm, watch, setValue } = useForm<MovimientoRequest>({
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
    watch,
    setValue,
  };
}

/**
 * Hook para obtener movimientos por info inicial (mes actual).
 * Retorna los movimientos agrupados por info inicial.
 */
export function useMovimientosPorInfo() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<MovimientosPorInfoSearchResponse | null>(null);

  const fetchMovimientos = async () => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await movimientoService.getByInfoInicial(accessToken);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al obtener los movimientos', logLabel: 'fetchMovimientosPorInfo' }
    );
  };

  return {
    data,
    loading,
    error,
    fetchMovimientos,
    refetch: fetchMovimientos,
  };
}

/**
 * Hook para obtener un movimiento por su ID.
 * Retorna el movimiento específico solicitado.
 */
export function useMovimientoById(id: string | number | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<MovimientoSearchResponse | null>(null);

  const fetchMovimientoById = async () => {
    if (id == null || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await movimientoService.getById(accessToken, String(id));
        setData(response);
        return response;
      },
      { errorFallback: 'Error al obtener el movimiento', logLabel: 'fetchMovimientoById' }
    );
  };

  return {
    data,
    loading,
    error,
    fetchMovimientoById,
    refetch: fetchMovimientoById,
  };
}

/**
 * Hook para actualizar un movimiento existente.
 */
export function useUpdateMovimiento() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<MovimientoResponse | null>(null);

  const update = async (id: string | number, request: Partial<MovimientoRequest>) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await movimientoService.update(accessToken, String(id), request);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al actualizar el movimiento', logLabel: 'updateMovimiento' }
    );
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    update,
    reset,
  };
}

/**
 * Hook para eliminar un movimiento.
 */
export function useDeleteMovimiento() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();

  const deleteMovimiento = async (id: string | number) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        await movimientoService.delete(accessToken, String(id));
      },
      { errorFallback: 'Error al eliminar el movimiento', logLabel: 'deleteMovimiento' }
    );
  };

  return {
    loading,
    error,
    deleteMovimiento,
  };
}

/**
 * Hook para obtener movimientos con filtros.
 * Retorna los movimientos filtrados según los parámetros proporcionados.
 */
export function useMovimientosConFiltros(initialFiltros?: MovimientoFiltros) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<MovimientosPorInfoSearchResponse | null>(null);
  const [filtros, setFiltros] = useState<MovimientoFiltros | undefined>(initialFiltros);

  const fetchMovimientos = async (nuevosFiltros?: MovimientoFiltros) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    const filtrosAplicar = nuevosFiltros ?? filtros;
    await run(
      async () => {
        const response = await movimientoService.search(accessToken, filtrosAplicar);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al obtener los movimientos', logLabel: 'fetchMovimientosConFiltros' }
    );
  };

  const aplicarFiltros = (nuevosFiltros: MovimientoFiltros) => {
    setFiltros(nuevosFiltros);
    fetchMovimientos(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setFiltros(undefined);
    fetchMovimientos(undefined);
  };

  return {
    data,
    loading,
    error,
    filtros,
    fetchMovimientos,
    aplicarFiltros,
    limpiarFiltros,
    refetch: fetchMovimientos,
  };
}