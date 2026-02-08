import { InfoInicialResponse } from '@/features/info-inicial/interfaces/info-inicial.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Menu, Text } from 'react-native-paper';
import { MESES } from '../utils/meses';

export interface MesSelectorCardProps {
  mesSeleccionado: string;
  anioSeleccionado: number;
  mesesDisponibles: InfoInicialResponse[];
  menuVisible: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
  onSeleccionarMes: (mes: string, anio: number) => void;
}

export function MesSelectorCard({
  mesSeleccionado,
  anioSeleccionado,
  mesesDisponibles,
  menuVisible,
  onMenuOpen,
  onMenuClose,
  onSeleccionarMes,
}: MesSelectorCardProps) {
  const mesesOrdenados = [...mesesDisponibles].sort((a, b) => {
    if (a.anio !== b.anio) return b.anio - a.anio;
    return MESES.indexOf(b.mes as (typeof MESES)[number]) - MESES.indexOf(a.mes as (typeof MESES)[number]);
  });

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="calendar-month" size={24} color="#6CB4EE" />
          <Text variant="titleMedium" style={styles.title}>
            Seleccionar Mes
          </Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={onMenuClose}
          anchor={
            <TouchableOpacity style={styles.button} onPress={onMenuOpen}>
              <Text variant="bodyLarge" style={styles.buttonText}>
                {mesSeleccionado} {anioSeleccionado}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color="#666666" />
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          {mesesOrdenados.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Text variant="bodyMedium" style={styles.emptyMenuText}>
                No hay meses disponibles
              </Text>
            </View>
          ) : (
            mesesOrdenados.map((info) => (
              <Menu.Item
                key={info.id}
                onPress={() => onSeleccionarMes(info.mes, info.anio)}
                title={`${info.mes} ${info.anio}`}
                titleStyle={styles.menuItemText}
              />
            ))
          )}
        </Menu>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontWeight: '600',
    color: '#333333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    color: '#333333',
    fontWeight: '500',
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
  },
  menuItemText: {
    color: '#333333',
  },
  emptyMenu: {
    padding: 16,
    alignItems: 'center',
  },
  emptyMenuText: {
    color: '#666666',
  },
});
