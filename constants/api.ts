import { Platform } from 'react-native';

/**
 * URL base de la API
 * 
 * En React Native:
 * - Android Emulator: usa '10.0.2.2' (alias especial para localhost del host)
 * - iOS Simulator: 'localhost' funciona
 * - Dispositivos físicos: usa la IP local de tu máquina (ej: '192.168.1.100')
 * - Web: 'localhost' funciona
 * 
 * Para desarrollo, puedes cambiar esta IP según tu entorno.
 * Para producción, usa la URL de tu servidor.
 */
const getApiUrl = () => {
  // Si hay una variable de entorno, úsala (útil para diferentes entornos)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Para desarrollo local
  if (Platform.OS === 'android') {
    // Android Emulator usa 10.0.2.2 para acceder a localhost del host
    // Si estás usando un dispositivo físico, cambia esto por tu IP local
    return 'http://10.0.2.2:3000';
  }

  // iOS Simulator y Web pueden usar localhost
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

// Log en desarrollo para facilitar debugging
if (__DEV__) {
  console.log('🔗 API URL configurada:', API_URL);
  console.log('📱 Plataforma:', Platform.OS);
}