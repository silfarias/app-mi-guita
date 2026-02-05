import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Usuario } from '../features/auth/interfaces/usuario.interface';

interface AuthState {
  // Estado de autenticación
  accessToken: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;

      // Acciones
      setAuth: (token: string, usuario: Usuario) => void;
      setUsuario: (usuario: Usuario) => void;
      logout: () => void;
      updateUsuario: (usuario: Partial<Usuario>) => void;
      initializeAuth: () => Promise<void>;
      clearStorage: () => Promise<void>;
}

/**
 * Store de Zustand para manejar el estado de autenticación con persistencia
 * 
 * Guarda tanto el access_token como el usuario porque:
 * - access_token: Se necesita para hacer peticiones autenticadas al backend
 * - usuario: Se necesita para mostrar información del usuario en la UI
 *   (nombre, foto de perfil, email, etc.)
 * 
 * Los datos se persisten en AsyncStorage para que sobrevivan al cierre de la app
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial
      accessToken: null,
      usuario: null,
      isAuthenticated: false,

      // Función para establecer la autenticación después del login
      setAuth: (token: string, usuario: Usuario) => {
        set({
          accessToken: token,
          usuario,
          isAuthenticated: true,
        });
      },

      // Función para actualizar solo el usuario (útil después de editar perfil)
      setUsuario: (usuario: Usuario) => {
        set((state) => ({
          usuario,
          isAuthenticated: state.isAuthenticated,
        }));
      },

      // Función para hacer logout
      logout: () => {
        set({
          accessToken: null,
          usuario: null,
          isAuthenticated: false,
        });
      },

      // Función para actualizar parcialmente los datos del usuario
      // (útil cuando el usuario actualiza su perfil)
      updateUsuario: (updatedUsuario: Partial<Usuario>) => {
        set((state) => ({
          usuario: state.usuario
            ? { ...state.usuario, ...updatedUsuario }
            : null,
        }));
      },

      // Función para inicializar la autenticación desde el almacenamiento persistente
      // Se llama al iniciar la app para restaurar la sesión
      initializeAuth: async () => {
        // Esta función se ejecuta automáticamente cuando se carga el store persistido
        // No necesitamos hacer nada aquí, Zustand lo maneja automáticamente
      },

      // Función para limpiar completamente el storage
      clearStorage: async () => {
        try {
          await AsyncStorage.removeItem('auth-storage');
          // Resetear el estado también
          set({
            accessToken: null,
            usuario: null,
            isAuthenticated: false,
          });
          console.log('✅ Storage limpiado correctamente');
        } catch (error) {
          console.error('❌ Error al limpiar storage:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage', // Nombre de la clave en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistir estos campos
      partialize: (state) => ({
        accessToken: state.accessToken,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
