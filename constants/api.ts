import { Platform } from 'react-native';

const getApiUrl = () => {
  let url = process.env.EXPO_PUBLIC_API_URL;
  if (url?.includes('0.0.0.0')) {
    url = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  }
  if (url) return url;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

if (__DEV__) {
  console.log('🔗 API URL:', API_URL, '| Plataforma:', Platform.OS);
}
