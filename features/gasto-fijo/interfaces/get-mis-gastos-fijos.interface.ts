import { Usuario } from "@/features/auth/interfaces/usuario.interface";
import { GastoFijoResponse } from "./gasto-fijo.interface";
import { SearchMetadata } from "@/types/api.types";

/**
 * Respuesta de GET /gasto-fijo/mis-gastos-fijos.
 * Estructura: { usuario, gastosFijos, metadata }.
 * Cada ítem en gastosFijos tiene id, nombre, montoEstimado, diaVencimiento (ISO o YYYY-MM-DD), activo, esDebitoAutomatico, categoria.
 */
export interface GetMisGastosFijosResponse {
  usuario: Usuario;
  gastosFijos: GastoFijoResponse[];
  metadata?: SearchMetadata;
}