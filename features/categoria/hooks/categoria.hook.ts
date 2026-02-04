import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import { Categoria, CategoriaSearchMetadata, CategoriaSearchParams } from '../interfaces/categoria.interface';
import { CategoriaService } from '../services/categoria.service';
import { useAsyncRun } from '../../../hooks/use-async-run';

const categoriaService = new CategoriaService();

export function useCategorias(initialParams?: CategoriaSearchParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<Categoria[]>([]);
  const [metadata, setMetadata] = useState<CategoriaSearchMetadata | null>(null);

  const fetchCategorias = async (params?: CategoriaSearchParams) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const searchParams = params ?? initialParams;
        const response = await categoriaService.search(accessToken, searchParams);
        setData(response.data);
        setMetadata(response.metadata);
      },
      { errorFallback: 'Error al obtener categorías', logLabel: 'fetchCategorias' }
    );
  };

  return {
    data,
    metadata,
    loading,
    error,
    refetch: () => fetchCategorias(initialParams),
    fetchCategorias,
  };
}

export function useCategoria(id: number | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [data, setData] = useState<Categoria | null>(null);

  const fetchCategoria = async () => {
    if (id == null || !accessToken) {
      if (!accessToken) setError('No hay sesión activa');
      return;
    }
    await run(
      async () => {
        const item = await categoriaService.getById(id, accessToken);
        setData(item);
      },
      { errorFallback: 'Error al obtener la categoría', logLabel: 'fetchCategoria' }
    );
  };

  return {
    data,
    loading,
    error,
    refetch: fetchCategoria,
    fetchCategoria,
  };
}
