import { Platform } from 'react-native';

/**
 * URL del backend.
 * - Emulador Android: debe ser http://10.0.2.2:3000 (10.0.2.2 = host desde el emulador).
 * - Dispositivo físico Android (misma WiFi): IP de tu PC, ej. http://192.168.1.36:3000
 * - iOS emulador: http://localhost:3000
 */
const getApiUrl = () => {
  let url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (url?.includes('0.0.0.0')) {
    url = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  }
  if (url) return url.replace(/\/$/, ''); // quitar barra final si la tiene
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

if (__DEV__) {
  console.log('🔗 API URL:', API_URL, '| Plataforma:', Platform.OS);
}
