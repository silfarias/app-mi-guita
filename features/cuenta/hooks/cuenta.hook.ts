import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useAsyncRun } from '@/hooks/use-async-run';
import { CuentaItemResponse } from '../interfaces/cuenta.interface';
import { CuentaService } from '../services/cuenta.service';

const cuentaService = new CuentaService();

export function useCuentas() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<CuentaItemResponse[]>([]);

  const fetch = async () => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await cuentaService.getByUsuario(accessToken);
        // Soportar respuesta como array o como objeto { data/content/cuentas: CuentaItemResponse[] }
        const list = Array.isArray(response)
          ? response
          : (response as any)?.data ?? (response as any)?.content ?? (response as any)?.cuentas ?? [];
        setData(Array.isArray(list) ? list : []);
        return response;
      },
      {
        errorFallback: 'Error al obtener las cuentas',
        logLabel: 'cuenta.getByUsuario',
      }
    );
  };

  return {
    data,
    cuentas: data,
    loading,
    error,
    fetch,
    refetch: fetch,
  };
}
