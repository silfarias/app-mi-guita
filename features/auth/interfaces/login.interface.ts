import { Usuario } from "./usuario.interface";

export interface LoginRequest {
    nombreUsuario: string;
    contrasena: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    usuario: Usuario;
}