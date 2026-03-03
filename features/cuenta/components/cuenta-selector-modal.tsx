import { CuentaItemResponse } from '@/features/cuenta/interfaces/cuenta.interface';
import { useCuentas } from '@/features/cuenta/hooks/cuenta.hook';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

export interface CuentaSelectorModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (cuenta: CuentaItemResponse) => void;
  selectedValue?: number;
  disabled?: boolean;
}

export function CuentaSelectorModal({
  visible,
  onDismiss,
  onSelect,
  selectedValue,
  disabled = false,
}: CuentaSelectorModalProps) {
  const { data: cuentas, loading: cuentasLoading, fetch: fetchCuentas } = useCuentas();

  useEffect(() => {
    if (visible) {
      fetchCuentas();
    }
  }, [visible]);

  const handleSelect = (cuenta: CuentaItemResponse) => {
    if (!disabled) {
      onSelect(cuenta);
      onDismiss();
    }
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
                Seleccionar cuenta
              </Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {cuentasLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#6CB4EE" />
                <Text variant="bodySmall" style={styles.loadingText}>
                  Cargando cuentas...
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollView}>
                {!cuentas?.length ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="wallet-outline" size={48} color="#999999" />
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      No hay cuentas cargadas
                    </Text>
                  </View>
                ) : (
                  cuentas.map((cuenta) => (
                    <TouchableOpacity
                      key={cuenta.id}
                      onPress={() => handleSelect(cuenta)}
                      disabled={disabled}
                      style={[
                        styles.item,
                        selectedValue === cuenta.id && styles.itemSelected,
                      ]}
                    >
                      <View style={styles.itemContent}>
                        <MaterialCommunityIcons
                          name="wallet"
                          size={24}
                          color="#6CB4EE"
                          style={styles.itemIcon}
                        />
                        <View style={styles.itemTextContainer}>
                          <Text variant="bodyLarge" style={styles.itemText}>
                            {cuenta.nombre}
                          </Text>
                          <Text variant="bodySmall" style={styles.itemSubtext}>
                            Saldo: ${Number(cuenta.saldoActual).toLocaleString('es-AR')}
                          </Text>
                        </View>
                      </View>
                      {selectedValue === cuenta.id && (
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
    shadowOffset: { width: 0, height: 4 },
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
    backgroundColor: '#E3F2FD',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontWeight: '500',
    color: '#333333',
  },
  itemSubtext: {
    marginTop: 4,
    color: '#666666',
  },
});
