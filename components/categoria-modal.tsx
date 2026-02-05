import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
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
import { Text, TextInput } from 'react-native-paper';

interface CategoriaModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (categoriaId: number) => void;
  selectedValue?: number;
  disabled?: boolean;
}

export function CategoriaModal({
  visible,
  onDismiss,
  onSelect,
  selectedValue,
  disabled = false,
}: CategoriaModalProps) {
  const [searchText, setSearchText] = useState('');
  const { data: categorias, loading: categoriasLoading, fetchCategorias } = useCategorias({ activo: true });

  // Efecto para cargar todas las categorías cuando se abre el modal
  useEffect(() => {
    if (visible) {
      if (!searchText) {
        fetchCategorias({ activo: true });
      }
    } else {
      // Resetear búsqueda cuando se cierra el modal
      setSearchText('');
    }
  }, [visible]);

  // Efecto para buscar categorías cuando cambia el texto de búsqueda
  useEffect(() => {
    if (visible && searchText && searchText.trim()) {
      const timer = setTimeout(() => {
        fetchCategorias({
          activo: true,
          nombre: searchText.trim(),
        });
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timer);
    } else if (visible && !searchText) {
      // Si se limpia la búsqueda, cargar todas las categorías
      fetchCategorias({ activo: true });
    }
  }, [searchText, visible]);

  const handleSelect = (categoriaId: number) => {
    if (!disabled) {
      onSelect(categoriaId);
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
              <Text variant="titleLarge" style={styles.title}>
                Seleccionar Categoría
              </Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {/* Buscador de categorías */}
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Buscar categoría..."
                value={searchText}
                onChangeText={setSearchText}
                mode="outlined"
                style={styles.searchInput}
                contentStyle={styles.searchInputContent}
                outlineStyle={styles.searchInputOutline}
                left={<TextInput.Icon icon="magnify" />}
                right={
                  searchText ? (
                    <TextInput.Icon icon="close" onPress={() => setSearchText('')} />
                  ) : undefined
                }
                disabled={disabled}
              />
            </View>

            {categoriasLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#6CB4EE" />
                <Text variant="bodySmall" style={styles.loadingText}>
                  Buscando categorías...
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollView}>
                {categorias.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="magnify" size={48} color="#999999" />
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      No se encontraron categorías
                    </Text>
                    {searchText && (
                      <Text variant="bodySmall" style={styles.emptySubtext}>
                        Intenta con otro término de búsqueda
                      </Text>
                    )}
                  </View>
                ) : (
                  categorias.map((categoria) => (
                    <TouchableOpacity
                      key={categoria.id}
                      onPress={() => handleSelect(categoria.id)}
                      disabled={disabled}
                      style={[
                        styles.item,
                        selectedValue === categoria.id && styles.itemSelected,
                      ]}
                    >
                      <View style={styles.itemContent}>
                        <MaterialCommunityIcons
                          name={categoria.icono as any}
                          size={24}
                          color={categoria.color}
                          style={styles.itemIcon}
                        />
                        <View style={styles.itemTextContainer}>
                          <Text
                            variant="bodyLarge"
                            style={[styles.itemText, { color: categoria.color }]}
                          >
                            {categoria.nombre}
                          </Text>
                          {categoria.descripcion && (
                            <Text variant="bodySmall" style={styles.itemDescription}>
                              {categoria.descripcion}
                            </Text>
                          )}
                        </View>
                      </View>
                      {selectedValue === categoria.id && (
                        <MaterialCommunityIcons name="check" size={24} color={categoria.color} />
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
  },
  searchInputContent: {
    fontSize: 16,
  },
  searchInputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
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
  emptySubtext: {
    marginTop: 8,
    color: '#999999',
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
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontWeight: '500',
    color: '#333333',
  },
  itemDescription: {
    marginTop: 4,
    color: '#666666',
  },
});
