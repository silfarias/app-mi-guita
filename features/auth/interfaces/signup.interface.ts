import { Usuario } from "./usuario.interface";

export interface SignupRequest {
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    contrasena: string;
    fotoPerfil?: File | Blob; // Para multipart/form-data
}

export interface SignupResponse {
    access_token: string;
    usuario: Usuario;
    message: string;
}
