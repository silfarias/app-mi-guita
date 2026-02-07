import { useState } from 'react';
import { useAsyncRun } from '../../../hooks/use-async-run';
import { useAuthStore } from '../../../store/auth.store';
import { BulkGastoFijoRequest, GastoFijoRequest } from '../interfaces/gasto-fijo-request.interface';
import { GastoFijoResponse } from '../interfaces/gasto-fijo.interface';
import { GetMisGastosFijosResponse } from '../interfaces/get-mis-gastos-fijos.interface';
import { GastoFijoService } from '../services/gasto-fijo.service';

const gastoFijoService = new GastoFijoService();


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

export function useMisGastosFijos() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<GetMisGastosFijosResponse | null>(null);

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
    gastosFijos: data?.gastosFijos ?? [],
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

/**
 * Hook para eliminar un gasto fijo.
 */
export function useDeleteGastoFijo() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();

  const deleteGastoFijo = async (id: string | number) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        await gastoFijoService.delete(accessToken, String(id));
      },
      { errorFallback: 'Error al eliminar el gasto fijo', logLabel: 'deleteGastoFijo' }
    );
  };

  return {
    loading,
    error,
    deleteGastoFijo,
  };
}
