import { BalanceCard } from '@/components/balance-card';
import { ComparacionMesAnterior } from '@/components/comparacion-mes-anterior';
import { GraficoTortaCategorias } from '@/components/grafico-torta-categorias';
import { ResumenCards } from '@/components/resumen-cards';
import { SaldosPorMedioPago } from '@/components/saldos-por-medio-pago';
import { Top5Categorias } from '@/components/top5-categorias';
import { ReporteMensualResponse } from '@/features/reporte/interfaces/reporte.interface';
import { Fragment } from 'react';

export interface ResumenHistoricoSectionProps {
  reporte: ReporteMensualResponse | null;
}

/**
 * Sección del resumen mensual (ingresos, egresos, balance, gráficos).
 * Solo lectura, sin acciones de edición.
 */
export function ResumenHistoricoSection({ reporte }: ResumenHistoricoSectionProps) {
  if (!reporte) return null;

  return (
    <Fragment>
      <ResumenCards
        totalIngresos={reporte.totalIngresos}
        totalEgresos={reporte.totalEgresos}
      />
      <BalanceCard balanceTotal={reporte.balanceTotal} balanceMes={reporte.balance} />
      {reporte.comparacionMesAnterior && (
        <ComparacionMesAnterior comparacion={reporte.comparacionMesAnterior} />
      )}
      {reporte.resumenPorCategoria && reporte.resumenPorCategoria.length > 0 && (
        <GraficoTortaCategorias data={reporte.resumenPorCategoria} />
      )}
      {reporte.top5Categorias && reporte.top5Categorias.length > 0 && (
        <Top5Categorias categorias={reporte.top5Categorias} />
      )}
      {reporte.saldosPorMedioPago && reporte.saldosPorMedioPago.length > 0 && (
        <SaldosPorMedioPago saldos={reporte.saldosPorMedioPago} showDetails={false} />
      )}
    </Fragment>
  );
}
