/**
 * Obtiene el mes actual en español en formato de texto completo (ej: "FEBRERO", "MARZO")
 * @returns El nombre del mes actual en mayúsculas
 */
export function getCurrentMonth(): string {
  const meses = [
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
  ];

  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth(); // 0-11

  return meses[mesActual];
}

/**
 * Obtiene el año actual
 * @returns El año actual como número
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Obtiene el mes y año actual en formato de texto
 * @returns Un objeto con el mes y año actual
 */
export function getCurrentMonthAndYear(): { mes: string; anio: number } {
  return {
    mes: getCurrentMonth(),
    anio: getCurrentYear(),
  };
}
