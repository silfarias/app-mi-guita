import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import {
  PagoGastoFijoByIdResponse,
  PagoGastoFijoPorInfoInicialResponse,
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

export function usePagosPorInfoInicial(infoInicialId: number | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<PagoGastoFijoPorInfoInicialResponse | null>(null);

  const fetchPagosPorInfoInicial = async () => {
    if (infoInicialId == null || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await pagoGastoFijoService.getPorInfoInicial(accessToken, infoInicialId);
        setData(response);
        return response;
      },
      {
        errorFallback: 'Error al obtener los pagos por info inicial',
        logLabel: 'pago-gasto-fijo.getPorInfoInicial',
      }
    );
  };

  return {
    data,
    infoInicial: data?.infoInicial ?? null,
    pagos: data?.pagos ?? [],
    loading,
    error,
    fetchPagosPorInfoInicial,
    refetch: fetchPagosPorInfoInicial,
  };
}
