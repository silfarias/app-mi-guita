import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import {
  PagoGastoFijoByIdResponse,
  PagoGastoFijoPorMesResponse,
  PagoGastoFijoRequest,
} from '../interfaces/pago-gasto-fijo.interface';
import { PagoGastoFijoService } from '../services/pago-gasto-fijo.service';
import { useAsyncRun } from '../../../hooks/use-async-run';

const pagoGastoFijoService = new PagoGastoFijoService();

export function usePagoGastoFijoById(id: number | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<PagoGastoFijoByIdResponse | null>(null);

  const fetchPagoGastoFijo = async () => {
    if (id == null || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await pagoGastoFijoService.getById(accessToken, id);
        setData(response);
        return response;
      },
      {
        errorFallback: 'Error al obtener el pago de gasto fijo',
        logLabel: 'pago-gasto-fijo.getById',
      }
    );
  };

  return {
    data,
    loading,
    error,
    fetchPagoGastoFijo,
    refetch: fetchPagoGastoFijo,
  };
}

export function useUpdatePagoGastoFijo() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<PagoGastoFijoByIdResponse | null>(null);

  const update = async (id: string | number, request: Partial<PagoGastoFijoRequest>) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await pagoGastoFijoService.update(accessToken, String(id), request);
        setData(response);
        return response;
      },
      {
        errorFallback: 'Error al actualizar el pago de gasto fijo',
        logLabel: 'pago-gasto-fijo.update',
      }
    );
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { data, loading, error, update, reset };
}

/** Hook para obtener los pagos de gastos fijos de un mes/año (sin info inicial). */
export function usePagosGastoFijoPorMes(anio: number | null | undefined, mes: string | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<PagoGastoFijoPorMesResponse | null>(null);

  const fetchPagosPorMes = async () => {
    if (anio == null || !mes || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await pagoGastoFijoService.getPagosPorMes(accessToken, anio, mes);
        setData(response);
        return response;
      },
      {
        errorFallback: 'Error al obtener los pagos de gastos fijos del mes',
        logLabel: 'pago-gasto-fijo.getPagosPorMes',
      }
    );
  };

  return {
    data,
    pagos: data?.pagos ?? [],
    loading,
    error,
    fetchPagosPorMes,
    refetch: fetchPagosPorMes,
  };
}
