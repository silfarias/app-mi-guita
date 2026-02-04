import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import { InfoInicialRequest, InfoInicialResponse } from '../interfaces/info-inicial.interface';
import { InfoInicialService } from '../services/info-inicial.service';
import { useAsyncRun } from '../../../hooks/use-async-run';

const infoInicialService = new InfoInicialService();

export function useInfoInicial() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<InfoInicialResponse | null>(null);

  const submit = async (request: InfoInicialRequest) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await infoInicialService.create(accessToken, request);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al registrar la información inicial', logLabel: 'infoInicial.create' }
    );
  };

  return { data, loading, error, submit };
}
