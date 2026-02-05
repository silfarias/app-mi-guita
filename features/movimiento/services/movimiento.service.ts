import { MovimientoRequest, MovimientoResponse } from "../interfaces/movimiento.interface";
import { fetchAuthPost } from "@/utils/api-client";

export class MovimientoService {
  async create(token: string, request: MovimientoRequest): Promise<MovimientoResponse> {
    return fetchAuthPost<MovimientoResponse, MovimientoRequest>(token, "/movimiento", request, {
      defaultError: "Error al crear el movimiento",
    });
  }
}
