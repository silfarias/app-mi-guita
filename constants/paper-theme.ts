import { MD3LightTheme } from 'react-native-paper';

/**
 * Tema personalizado de React Native Paper
 * Paleta de colores basada en la bandera argentina 🇦🇷
 * Celeste y blanco - Colores patrios
 */
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6CB4EE', // Celeste argentino
    primaryContainer: '#B8E0F5', // Celeste claro
    secondary: '#4A9BD9', // Celeste oscuro
    surface: '#FFFFFF', // Blanco
    surfaceVariant: '#F0F8FF', // Azul muy claro (cielo)
    onSurface: '#333333',
    onSurfaceVariant: '#666666',
    outline: '#A8D5E8', // Celeste para bordes
  },
};
