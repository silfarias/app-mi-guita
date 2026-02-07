import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import { ResumenPagoGastoFijoResponse } from '../interfaces/resumen-pago-gasto-fijo.interface';
import { ResumenPagoGastoFijoService } from '../services/resumen-pago-gasto-fijo.service';
import { useAsyncRun } from '../../../hooks/use-async-run';

const resumenPagoGastoFijoService = new ResumenPagoGastoFijoService();

export function useResumenPagoGastoFijo(infoInicialId: number | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<ResumenPagoGastoFijoResponse | null>(null);

  const fetchResumen = async () => {
    if (infoInicialId == null || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await resumenPagoGastoFijoService.getPorInfoInicial(
          accessToken,
          infoInicialId
        );
        setData(response);
        return response;
      },
      {
        errorFallback: 'Error al obtener el resumen de pagos',
        logLabel: 'resumen-pago-gasto-fijo.getPorInfoInicial',
      }
    );
  };

  return {
    data,
    loading,
    error,
    fetchResumen,
    refetch: fetchResumen,
  };
}
