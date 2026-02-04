import { Usuario } from "./usuario.interface";

export interface LoginResponse {
    access_token: string;
    usuario: Usuario;
}

export interface LoginRequest {
    nombreUsuario: string;
    contrasena: string;
}