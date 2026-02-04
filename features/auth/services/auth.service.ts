import { API_URL } from "@/constants/api";
import { ChangePasswordRequest, ChangePasswordResponse } from "../interfaces/change-password.interface";
import { LoginRequest, LoginResponse } from "../interfaces/login.interface";
import { SignupRequest, SignupResponse } from "../interfaces/signup.interface";
import { Usuario } from "../interfaces/usuario.interface";

const NETWORK_ERROR_MESSAGE = (url: string) =>
  `No se pudo conectar al servidor. Verifica que el backend esté en ${url} y la IP sea correcta.`;

export class AuthService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        let errorMessage = "Error al iniciar sesión";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.errorDetails?.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error(NETWORK_ERROR_MESSAGE(API_URL));
      }
      throw error;
    }
  }

  async signup(request: SignupRequest): Promise<SignupResponse> {
    const formData = new FormData();
    formData.append('nombre', request.nombre);
    formData.append('apellido', request.apellido);
    formData.append('nombreUsuario', request.nombreUsuario);
    formData.append('email', request.email);
    formData.append('contrasena', request.contrasena);
    if (request.fotoPerfil) {
      if (request.fotoPerfil instanceof File) {
        formData.append('fotoPerfil', request.fotoPerfil);
      } else if (request.fotoPerfil instanceof Blob) {
        formData.append('fotoPerfil', request.fotoPerfil, 'foto-perfil.jpg');
      } else {
        const photoUri = request.fotoPerfil as any;
        formData.append('fotoPerfil', {
          uri: photoUri.uri || photoUri,
          type: photoUri.type || 'image/jpeg',
          name: photoUri.name || 'foto-perfil.jpg',
        } as any);
      }
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, { method: 'POST', body: formData });
      if (!response.ok) {
        let errorMessage = "Error al registrar usuario";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.errorDetails?.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error(NETWORK_ERROR_MESSAGE(API_URL));
      }
      throw error;
    }
  }

  async getCurrentUser(token: string): Promise<Usuario> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente");
      const errorData = await response.json();
      throw new Error(errorData?.errorDetails?.message || "Error al obtener información del usuario");
    }
    return response.json();
  }

  async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      if (response.status === 401) return { message: 'Sesión cerrada exitosamente' };
      const errorData = await response.json();
      throw new Error(errorData?.errorDetails?.message || "Error al cerrar sesión");
    }
    return response.json();
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.errorDetails?.message || "Error al cambiar contraseña");
    }
    return response.json();
  }
}
