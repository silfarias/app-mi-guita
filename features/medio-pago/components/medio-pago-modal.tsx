import { ItemMenuMedioPago } from '@/components/item-menu-medio-pago';
import { useMediosPago } from '@/features/medio-pago/hooks/medio-pago.hook';
import { MedioPago, TipoMedioPago } from '@/features/medio-pago/interfaces/medio-pago.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';



interface MedioPagoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (medio: MedioPago) => void;
  selectedValue?: number;
  disabled?: boolean;
  /** Si es true, excluye medios cuyo nombre contenga "efectivo" (ej. débito automático no puede ser efectivo). */
  excludeEfectivo?: boolean;
}

export function MedioPagoModal({
  visible,
  onDismiss,
  onSelect,
  selectedValue,
  disabled = false,
  excludeEfectivo = false,
}: MedioPagoModalProps) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoMedioPago | 'TODOS'>('TODOS');
  const { data: mediosPago, loading: mediosPagoLoading, fetchMediosPago } = useMediosPago();

  // Cargar medios de pago cuando se abre el modal o cambia el tipo seleccionado
  useEffect(() => {
    if (visible) {
      if (tipoSeleccionado === 'TODOS') {
        fetchMediosPago();
      } else {
        fetchMediosPago({ tipo: tipoSeleccionado });
      }
    }
  }, [visible, tipoSeleccionado]);

  // Resetear el tipo cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      setTipoSeleccionado('TODOS');
    }
  }, [visible]);

  const handleSelect = (medio: MedioPago) => {
    if (!disabled) {
      onSelect(medio);
      onDismiss();
    }
  };

  const getMedioPagoIcon = (tipo: string) => {
    return tipo === 'BILLETERA_VIRTUAL' ? 'wallet' : 'bank';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onDismiss}
        />
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text variant="titleMedium" style={styles.title}>
                Seleccionar Medio de Pago
              </Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {/* Barra de menú para filtrar por tipo */}
            <View style={styles.menuContainer}>
              <ItemMenuMedioPago
                tipo="TODOS"
                label="Todos"
                isActive={tipoSeleccionado === 'TODOS'}
                onPress={() => setTipoSeleccionado('TODOS')}
              />
              <ItemMenuMedioPago
                tipo={TipoMedioPago.BILLETERA_VIRTUAL}
                label="Billeteras"
                icon="wallet"
                isActive={tipoSeleccionado === TipoMedioPago.BILLETERA_VIRTUAL}
                onPress={() => setTipoSeleccionado(TipoMedioPago.BILLETERA_VIRTUAL)}
              />
              <ItemMenuMedioPago
                tipo={TipoMedioPago.BANCO}
                label="Bancos"
                icon="bank"
                isActive={tipoSeleccionado === TipoMedioPago.BANCO}
                onPress={() => setTipoSeleccionado(TipoMedioPago.BANCO)}
              />
            </View>

            {mediosPagoLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#6CB4EE" />
                <Text variant="bodySmall" style={styles.loadingText}>
                  Cargando medios de pago...
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollView}>
                {(excludeEfectivo
                  ? mediosPago.filter((m) => !m.nombre.toLowerCase().includes('efectivo'))
                  : mediosPago
                ).length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="wallet-outline" size={48} color="#999999" />
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      {excludeEfectivo
                        ? 'No hay medios de pago válidos (se excluye efectivo)'
                        : 'No hay medios de pago disponibles'}
                    </Text>
                  </View>
                ) : (
                  (excludeEfectivo
                    ? mediosPago.filter((m) => !m.nombre.toLowerCase().includes('efectivo'))
                    : mediosPago
                  ).map((medio) => (
                    <TouchableOpacity
                      key={medio.id}
                      onPress={() => handleSelect(medio)}
                      disabled={disabled}
                      style={[
                        styles.item,
                        selectedValue === medio.id && styles.itemSelected,
                      ]}
                    >
                      <View style={styles.itemContent}>
                        <MaterialCommunityIcons
                          name={getMedioPagoIcon(medio.tipo) as any}
                          size={24}
                          color="#6CB4EE"
                          style={styles.itemIcon}
                        />
                        <Text variant="bodyLarge" style={styles.itemText}>
                          {medio.nombre}
                        </Text>
                      </View>
                      {selectedValue === medio.id && (
                        <MaterialCommunityIcons name="check" size={24} color="#6CB4EE" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  menuContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  scrollView: {
    maxHeight: 400,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#666666',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemSelected: {
    backgroundColor: '#F5F5F5',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    fontWeight: '500',
    color: '#333333',
  },
});
