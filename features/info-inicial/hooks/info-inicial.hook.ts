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

/**
 * Hook para actualizar una información inicial existente.
 */
export function useUpdateInfoInicial() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<InfoInicialResponse | null>(null);

  const update = async (id: string | number, request: InfoInicialRequest) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await infoInicialService.update(accessToken, String(id), request);
        setData(response);
        return response;
      },
      { errorFallback: 'Error al actualizar la información inicial', logLabel: 'infoInicial.update' }
    );
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    update,
    reset,
  };
}

/**
 * Hook para obtener una información inicial por su ID.
 */
export function useInfoInicialById(id: string | number | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<InfoInicialResponse | null>(null);

  const fetchById = async () => {
    if (id == null || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const response = await infoInicialService.getById(accessToken, String(id));
        setData(response);
        return response;
      },
      { errorFallback: 'Error al obtener la información inicial', logLabel: 'infoInicial.getById' }
    );
  };

  return {
    data,
    loading,
    error,
    fetchById,
    refetch: fetchById,
  };
}