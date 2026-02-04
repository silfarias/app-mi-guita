import { Platform } from 'react-native';

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

if (__DEV__) {
  console.log('🔗 API URL:', API_URL, '| Plataforma:', Platform.OS);
}
