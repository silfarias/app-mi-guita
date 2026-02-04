import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import { MedioPago, MedioPagoSearchMetadata, MedioPagoSearchParams } from '../interfaces/medio-pago.interface';
import { MedioPagoService } from '../services/medio-pago.service';
import { useAsyncRun } from '../../../hooks/use-async-run';

const medioPagoService = new MedioPagoService();

export function useMediosPago(initialParams?: MedioPagoSearchParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<MedioPago[]>([]);
  const [metadata, setMetadata] = useState<MedioPagoSearchMetadata | null>(null);

  const fetchMediosPago = async (params?: MedioPagoSearchParams) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const searchParams = params ?? initialParams;
        const response = await medioPagoService.search(accessToken, searchParams);
        setData(response.data);
        setMetadata(response.metadata);
      },
      { errorFallback: 'Error al obtener medios de pago', logLabel: 'fetchMediosPago' }
    );
  };

  return {
    data,
    metadata,
    loading,
    error,
    refetch: () => fetchMediosPago(initialParams),
    fetchMediosPago,
  };
}

export function useMedioPago(id: number | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<MedioPago | null>(null);

  const fetchMedioPago = async () => {
    if (id == null || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const item = await medioPagoService.getById(id, accessToken);
        setData(item);
      },
      { errorFallback: 'Error al obtener el medio de pago', logLabel: 'fetchMedioPago' }
    );
  };

  return {
    data,
    loading,
    error,
    refetch: fetchMedioPago,
    fetchMedioPago,
  };
}
