import { useState } from 'react';

import { useAuthStore } from '@/store/auth.store';
import { useAsyncRun } from '@/hooks/use-async-run';
import { DashboardResumenResponse } from '../interfaces/dashboard.interface';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export function useDashboardResumen(anio: number, mes: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<DashboardResumenResponse | null>(null);

  const fetchDashboard = async () => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await dashboardService.getResumen(accessToken, anio, mes);
        setData(response);
        return response;
      },
      {
        errorFallback: 'Error al obtener el dashboard',
        logLabel: 'dashboard.getResumen',
      }
    );
  };

  return {
    data,
    loading,
    error,
    fetchDashboard,
    refetch: fetchDashboard,
  };
}

