export const formatDate = (dateString: string) => {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? parseDateLocal(dateString)
      : new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Parsea "YYYY-MM-DD" como fecha local (evita desfase por zona horaria).
 * new Date("2026-02-06") interpreta UTC medianoche → en UTC-3 queda día anterior.
 */
function parseDateLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/**
 * Formato corto con día de la semana y fecha (ej: "Viernes 6 Feb").
 * Útil para cards y listas. Soporta "YYYY-MM-DD" sin desfase de zona horaria.
 */
export function formatDateWithWeekday(dateString: string): string {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? parseDateLocal(dateString)
      : new Date(dateString);
    const diaSemana = DIAS_SEMANA[date.getDay()];
    const dia = date.getDate();
    const mes = MESES_CORTOS[date.getMonth()];
    return `${diaSemana} ${dia} ${mes}`;
  } catch {
    return dateString;
  }
}