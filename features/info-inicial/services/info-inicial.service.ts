import { InfoInicialRequest, InfoInicialResponse, InfoInicialPorUsuarioResponse } from "../interfaces/info-inicial.interface";
import { fetchAuthGet, fetchAuthPost, fetchAuthPatch } from "@/utils/api-client";

export class InfoInicialService {
  async create(token: string, request: InfoInicialRequest): Promise<InfoInicialResponse> {
    return fetchAuthPost<InfoInicialResponse, InfoInicialRequest>(token, "/info-inicial", request, {
      defaultError: "Error al registrar la información inicial",
    });
  }

  async update(token: string, id: string, request: InfoInicialRequest): Promise<InfoInicialResponse> {
    return fetchAuthPatch<InfoInicialResponse, InfoInicialRequest>(token, `/info-inicial/${id}`, request, {
      defaultError: "Error al actualizar la información inicial",
    });
  }

  async getByUsuario(token: string): Promise<InfoInicialPorUsuarioResponse> {
    return fetchAuthGet<InfoInicialPorUsuarioResponse>(token, `/info-inicial/por-usuario`, {
      defaultError: "Error al obtener la información inicial",
    });
  }

  async getById(token: string, id: string): Promise<InfoInicialResponse> {
    return fetchAuthGet<InfoInicialResponse>(token, `/info-inicial/${id}`, {
      defaultError: "Error al obtener la información inicial",
    });
  }
} 