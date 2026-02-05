import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import { ReporteMensualParams, ReporteMensualResponse } from '../interfaces/reporte.interface';
import { ReporteService } from '../services/reporte.service';
import { useAsyncRun } from '../../../hooks/use-async-run';

const reporteService = new ReporteService();

/**
 * Hook para obtener el reporte mensual.
 * Retorna el reporte con todos los datos financieros del mes especificado.
 */
export function useReporteMensual() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<ReporteMensualResponse | null>(null);

  const fetchReporteMensual = async (params: ReporteMensualParams) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await reporteService.getReporteMensual(accessToken, params);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al obtener el reporte mensual', logLabel: 'fetchReporteMensual' }
    );
  };

  return {
    data,
    loading,
    error,
    fetchReporteMensual,
    refetch: (params: ReporteMensualParams) => fetchReporteMensual(params),
  };
}
