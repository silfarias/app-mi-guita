import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import { InfoInicialRequest, InfoInicialResponse } from '../interfaces/info-inicial.interface';
import { InfoInicialService } from '../services/info-inicial.service';
import { useAsyncRun } from '../../../hooks/use-async-run';
import { SearchMetadata } from '../../../types/api.types';

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

/**
 * Hook para obtener la información inicial del usuario autenticado.
 * Retorna un array con la información inicial y los metadatos de la respuesta.
 */
export function useInfoInicialPorUsuario() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<InfoInicialResponse[]>([]);
  const [metadata, setMetadata] = useState<SearchMetadata | null>(null);

  const fetch = async () => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await infoInicialService.getByUsuario(accessToken);
        setData(response.data);
        setMetadata(response.metadata);
        return response;
      },
      { errorFallback: 'Error al obtener la información inicial', logLabel: 'infoInicial.getByUsuario' }
    );
  };

  return {
    data,
    metadata,
    loading,
    error,
    fetch,
    refetch: fetch,
  };
}