import { InfoInicialRequest, InfoInicialResponse, InfoInicialPorUsuarioResponse } from "../interfaces/info-inicial.interface";
import { fetchAuthGet, fetchAuthPost } from "@/utils/api-client";

export class InfoInicialService {
  async create(token: string, request: InfoInicialRequest): Promise<InfoInicialResponse> {
    return fetchAuthPost<InfoInicialResponse, InfoInicialRequest>(token, "/info-inicial", request, {
      defaultError: "Error al registrar la información inicial",
    });
  }
  async getByUsuario(token: string): Promise<InfoInicialPorUsuarioResponse> {
    return fetchAuthGet<InfoInicialPorUsuarioResponse>(token, `/info-inicial/por-usuario`, {
      defaultError: "Error al obtener la información inicial",
    });
  }
}