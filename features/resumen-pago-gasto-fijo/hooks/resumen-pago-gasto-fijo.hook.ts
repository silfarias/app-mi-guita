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
    setError(null); // Limpiar errores previos
    await run(
      async () => {
        const response = await resumenPagoGastoFijoService.getPorInfoInicial(
          accessToken,
          infoInicialId
        );
        setData(response);
        if (response === null) {
          setError(null); // Si no hay resumen, no es un error
        }
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
