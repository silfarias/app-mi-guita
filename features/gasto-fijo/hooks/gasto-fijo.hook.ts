import { useState } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { BulkGastoFijoRequest, GastoFijoRequest, GastoFijoResponse, UsuarioGastosFijosResponse } from '../interfaces/gasto-fijo.interface';
import { GastoFijoService } from '../services/gasto-fijo.service';
import { useAsyncRun } from '../../../hooks/use-async-run';

const gastoFijoService = new GastoFijoService();

/**
 * Hook para crear un solo gasto fijo.
 * Maneja la creación de un gasto fijo y retorna el gasto fijo creado.
 */
export function useCreateGastoFijo() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<GastoFijoResponse | null>(null);

  const create = async (request: GastoFijoRequest) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await gastoFijoService.create(accessToken, request);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al crear el gasto fijo', logLabel: 'gasto-fijo.create' }
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
    create,
    reset,
  };
}

/**
 * Hook para crear gastos fijos en bulk.
 * Maneja la creación de múltiples gastos fijos y retorna los gastos fijos creados.
 */
export function useCreateBulkGastoFijo() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<GastoFijoResponse[] | null>(null);

  const createBulk = async (request: BulkGastoFijoRequest) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await gastoFijoService.createBulk(accessToken, request);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al crear los gastos fijos', logLabel: 'gasto-fijo.createBulk' }
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
    createBulk,
    reset,
  };
}

/**
 * Hook para obtener los gastos fijos del usuario actual.
 * Retorna los gastos fijos con sus pagos asociados.
 */
export function useMisGastosFijos() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<UsuarioGastosFijosResponse | null>(null);

  const fetchMisGastosFijos = async () => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await gastoFijoService.getMisGastosFijos(accessToken);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al obtener los gastos fijos', logLabel: 'gasto-fijo.getMisGastosFijos' }
    );
  };

  return {
    data,
    loading,
    error,
    fetchMisGastosFijos,
    refetch: fetchMisGastosFijos,
  };
}

/**
 * Hook para obtener un gasto fijo por su ID.
 * Retorna el gasto fijo específico solicitado.
 */
export function useGastoFijoById(id: string | number | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<GastoFijoResponse | null>(null);

  const fetchGastoFijoById = async () => {
    if (id == null || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await gastoFijoService.getById(accessToken, String(id));
        setData(response);
        return response;
      },
      { errorFallback: 'Error al obtener el gasto fijo', logLabel: 'fetchGastoFijoById' }
    );
  };

  return {
    data,
    loading,
    error,
    fetchGastoFijoById,
    refetch: fetchGastoFijoById,
  };
}

/**
 * Hook para actualizar un gasto fijo existente.
 */
export function useUpdateGastoFijo() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<GastoFijoResponse | null>(null);

  const update = async (id: string | number, request: Partial<GastoFijoRequest>) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await gastoFijoService.update(accessToken, String(id), request);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al actualizar el gasto fijo', logLabel: 'gasto-fijo.update' }
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
