import { Usuario } from "@/features/auth/interfaces/usuario.interface";
import { GastoFijoResponse } from "./gasto-fijo.interface";
import { SearchMetadata } from "@/types/api.types";

export interface GetMisGastosFijosResponse {
  usuario: Usuario;
  gastosFijos: GastoFijoResponse[];
  metadata: SearchMetadata;
}