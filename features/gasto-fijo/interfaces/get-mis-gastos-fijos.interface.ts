import { Usuario } from "@/features/auth/interfaces/usuario.interface";
import { GastoFijoResponse } from "./gasto-fijo.interface";
import { SearchMetadata } from "@/types/api.types";

/** Respuesta de GET /gasto-fijo/mis-gastos-fijos. Cada ítem en gastosFijos no incluye array pagos. */
export interface GetMisGastosFijosResponse {
  usuario: Usuario;
  gastosFijos: GastoFijoResponse[];
  metadata?: SearchMetadata;
}