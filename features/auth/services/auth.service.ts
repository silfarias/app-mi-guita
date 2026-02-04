import { API_URL } from "@/constants/api";
import { ChangePasswordRequest, ChangePasswordResponse } from "../interfaces/change-password.interface";
import { LoginRequest, LoginResponse } from "../interfaces/login.interface";
import { SignupRequest, SignupResponse } from "../interfaces/signup.interface";
import { Usuario } from "../interfaces/usuario.interface";

export class AuthService {
    /**
     * Inicia sesión con nombre de usuario y contraseña
     * @param request - Credenciales de acceso (nombreUsuario, contrasena)
     * @returns Token JWT y datos del usuario
     */
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
                } catch (parseError) {
                    // Si no se puede parsear el error, usar el status
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            // Capturar errores de red (fetch falla antes de obtener respuesta)
            if (error instanceof TypeError && error.message === 'Network request failed') {
                throw new Error(
                    `No se pudo conectar al servidor. Verifica que:\n` +
                    `- El backend esté corriendo en ${API_URL}\n` +
                    `- Estés usando la IP correcta (Android: 10.0.2.2, iOS/Web: localhost)\n` +
                    `- Si usas dispositivo físico, usa tu IP local (ej: 192.168.1.100)`
                );
            }
            // Re-lanzar otros errores
            throw error;
        }
    }

    /**
     * Registra un nuevo usuario y lo autentica automáticamente
     * @param request - Datos del nuevo usuario (nombre, apellido, nombreUsuario, email, contrasena, fotoPerfil opcional)
     * @returns Token JWT, datos del usuario y mensaje de confirmación
     */
    async signup(request: SignupRequest): Promise<SignupResponse> {
        // Crear FormData para multipart/form-data
        const formData = new FormData();
        
        formData.append('nombre', request.nombre);
        formData.append('apellido', request.apellido);
        formData.append('nombreUsuario', request.nombreUsuario);
        formData.append('email', request.email);
        formData.append('contrasena', request.contrasena);
        
        // Agregar foto de perfil si existe
        if (request.fotoPerfil) {
            // En React Native, necesitamos crear un objeto con la estructura correcta
            // Para web, File funciona directamente
            // Para React Native, necesitamos usar un objeto con uri, type, name
            if (request.fotoPerfil instanceof File) {
                formData.append('fotoPerfil', request.fotoPerfil);
            } else if (request.fotoPerfil instanceof Blob) {
                formData.append('fotoPerfil', request.fotoPerfil, 'foto-perfil.jpg');
            } else {
                // Para React Native con URI
                const photoUri = request.fotoPerfil as any;
                formData.append('fotoPerfil', {
                    uri: photoUri.uri || photoUri,
                    type: photoUri.type || 'image/jpeg',
                    name: photoUri.name || 'foto-perfil.jpg',
                } as any);
            }
        }

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    // No establecer Content-Type, el navegador lo hace automáticamente con FormData
                    // y establece el boundary correcto
                },
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = "Error al registrar usuario";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData?.errorDetails?.message || errorMessage;
                } catch (parseError) {
                    // Si no se puede parsear el error, usar el status
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            // Capturar errores de red (fetch falla antes de obtener respuesta)
            if (error instanceof TypeError && error.message === 'Network request failed') {
                throw new Error(
                    `No se pudo conectar al servidor. Verifica que:\n` +
                    `- El backend esté corriendo en ${API_URL}\n` +
                    `- Estés usando la IP correcta (Android: 10.0.2.2, iOS/Web: localhost)\n` +
                    `- Si usas dispositivo físico, usa tu IP local (ej: 192.168.1.100)`
                );
            }
            // Re-lanzar otros errores
            throw error;
        }
    }

    /**
     * Obtiene la información del usuario autenticado
     * @param token - Token JWT de autenticación
     * @returns Datos completos del usuario
     */
    async getCurrentUser(token: string): Promise<Usuario> {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente");
            }
            const errorData = await response.json();
            throw new Error(errorData?.errorDetails?.message || "Error al obtener información del usuario");
        }

        return response.json();
    }

    /**
     * Cierra la sesión del usuario autenticado
     * @param token - Token JWT de autenticación
     * @returns Mensaje de confirmación
     */
    async logout(token: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Si el token ya es inválido, consideramos el logout como exitoso
                return { message: 'Sesión cerrada exitosamente' };
            }
            const errorData = await response.json();
            throw new Error(errorData?.errorDetails?.message || "Error al cerrar sesión");
        }

        return response.json();
    }

    /**
     * Cambia la contraseña del usuario
     * @param request - Datos para cambiar contraseña (email, contrasena, confirmarContrasena)
     * @returns Mensaje de confirmación y datos del usuario actualizados
     */
    async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.errorDetails?.message || "Error al cambiar contraseña");
        }

        return response.json();
    }
}
