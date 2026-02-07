/**
 * Devuelve el nombre del icono de MaterialCommunityIcons según el tipo de medio de pago.
 */
export function getMedioPagoIcon(tipo: string): 'wallet' | 'bank' {
  return tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank';
}
