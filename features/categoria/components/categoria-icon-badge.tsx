import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export interface CategoriaIconBadgeProps {
  icono: string;
  color: string;
  size?: number;
  /** Opacidad del fondo en hex 2 dígitos (ej. "20"). Default "20" (~12.5%). */
  backgroundHex?: string;
}

const defaultSize = 48;

export function CategoriaIconBadge({
  icono,
  color,
  size = defaultSize,
  backgroundHex = '20',
}: CategoriaIconBadgeProps) {
  const bgColor = `${color}${backgroundHex}`;
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <MaterialCommunityIcons name={icono as any} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
