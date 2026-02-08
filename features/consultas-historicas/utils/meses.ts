export const MESES = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
] as const;

/**
 * Obtiene las fechas de inicio y fin de un mes dado.
 */
export function getFechasDelMes(mes: string, anio: number): {
  fechaDesde: string;
  fechaHasta: string;
} {
  const mesIndex = MESES.indexOf(mes as (typeof MESES)[number]);
  const fechaInicio = new Date(anio, mesIndex >= 0 ? mesIndex : 0, 1);
  const fechaFin = new Date(anio, (mesIndex >= 0 ? mesIndex : 0) + 1, 0, 23, 59, 59);

  return {
    fechaDesde: fechaInicio.toISOString().split('T')[0],
    fechaHasta: fechaFin.toISOString().split('T')[0],
  };
}
