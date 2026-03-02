import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useAsyncRun } from '@/hooks/use-async-run';
import { CuentaBulkItem, CuentaService } from '../services/cuenta.service';

const cuentaService = new CuentaService();

export function useCuentaOnboarding() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { loading, error, setError, run } = useAsyncRun();
  const [completed, setCompleted] = useState(false);

  const submitCuentas = async (cuentas: CuentaBulkItem[]) => {
    if (!accessToken) {
      setError('No hay sesión activa');
      return;
    }
    const cuentasValidas = cuentas.filter(
      (c) => c.nombre.trim() !== '' && c.saldoInicial >= 0
    );
    if (cuentasValidas.length === 0) {
      setError('Agregá al menos una cuenta con un monto válido');
      return;
    }

    await run(
      async () => {
        await cuentaService.createBulk(accessToken, { cuentas: cuentasValidas });
        setCompleted(true);
      },
      {
        errorFallback: 'Error al registrar tus cuentas',
        logLabel: 'cuenta.onboarding.bulk',
      }
    );
  };

  return { submitCuentas, loading, error, completed };
}

