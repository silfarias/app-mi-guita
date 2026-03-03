import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';

import { MiGuitaBrand } from '@/components/miguita-brand';
import { useCategorias } from '@/features/categoria/hooks/categoria.hook';
import { useCreateBulkGastoFijo } from '@/features/gasto-fijo/hooks/gasto-fijo.hook';
import { BulkGastoFijoRequest } from '@/features/gasto-fijo/interfaces/gasto-fijo-request.interface';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const primary = '#4DA6FF';
const primaryLight = '#E6F2FF';

type LocalGastoFijo = {
  id: number;
  nombre: string;
  categoriaId: number | null;
  categoriaNombre: string;
  monto: string;
};

export default function SetupGastosFijosScreen() {
  const [gastos, setGastos] = useState<LocalGastoFijo[]>([
    { id: 1, nombre: '', categoriaId: null, categoriaNombre: '', monto: '' },
  ]);
  const { data: categorias, fetchCategorias } = useCategorias({ activo: true });
  const { createBulk, loading, error, reset } = useCreateBulkGastoFijo();
  const [completed, setCompleted] = useState(false);
  const [categoriaMenuVisible, setCategoriaMenuVisible] = useState<number | null>(null);

  useEffect(() => {
    fetchCategorias({ activo: true });
  }, []);

  useEffect(() => {
    if (completed) {
      router.replace('/setup-presupuestos' as any);
    }
  }, [completed]);

  const handleChange = (id: number, field: keyof LocalGastoFijo, value: string | number | null) => {
    setGastos((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const next = { ...g, [field]: value };
        if (field === 'categoriaId' && typeof value === 'number') {
          const cat = categorias?.find((c) => c.id === value);
          next.categoriaNombre = cat?.nombre ?? '';
        }
        return next;
      })
    );
  };

  const handleAdd = () => {
    const nextId = gastos.length ? Math.max(...gastos.map((g) => g.id)) + 1 : 1;
    setGastos((prev) => [
      ...prev,
      { id: nextId, nombre: '', categoriaId: null, categoriaNombre: '', monto: '' },
    ]);
  };

  const handleRemove = (id: number) => {
    if (gastos.length === 1) return;
    setGastos((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSubmit = async () => {
    reset();
    const validos = gastos.filter((g) => g.nombre.trim() !== '' && g.categoriaId != null);
    if (validos.length === 0) {
      return;
    }
    const payload: BulkGastoFijoRequest = {
      gastosFijos: validos.map((g) => ({
        nombre: g.nombre.trim(),
        categoriaId: g.categoriaId!,
        montoFijo: Number(g.monto) || 0,
        esDebitoAutomatico: false,
      })),
    };
    const res = await createBulk(payload);
    if (res && res.length > 0) {
      setCompleted(true);
    }
  };

  const handleSkip = () => {
    router.replace('/setup-presupuestos' as any);
  };

  const canSubmit = gastos.some((g) => g.nombre.trim() !== '' && g.categoriaId != null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandWrapper}>
          <MiGuitaBrand />
        </View>

        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.badge}>
            Paso 2 de 4
          </Text>
          <Text variant="headlineSmall" style={styles.title}>
            Agregá tus gastos mensuales
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Luz, Internet, Alquiler... Solo nombre y categoría. El monto es opcional.
          </Text>

          {gastos.map((gasto, index) => (
            <View key={gasto.id} style={styles.row}>
              <Text style={styles.label}>Gasto {index + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre (Luz, Internet, Alquiler...)"
                value={gasto.nombre}
                onChangeText={(text) => handleChange(gasto.id, 'nombre', text)}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setCategoriaMenuVisible(gasto.id)}
                disabled={loading}
              >
                <Text style={gasto.categoriaNombre ? styles.selectText : styles.selectPlaceholder}>
                  {gasto.categoriaNombre || 'Seleccionar categoría'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666666" />
              </TouchableOpacity>
              {categoriaMenuVisible === gasto.id && (
                <View style={styles.menu}>
                  {categorias?.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.menuItem}
                      onPress={() => {
                        handleChange(gasto.id, 'categoriaId', c.id);
                        setCategoriaMenuVisible(null);
                      }}
                    >
                      <Text>{c.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setCategoriaMenuVisible(null)}
                  >
                    <Text style={{ color: '#666' }}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder="Monto (opcional)"
                keyboardType="numeric"
                value={gasto.monto}
                onChangeText={(text) => handleChange(gasto.id, 'monto', text)}
                editable={!loading}
              />
              {gastos.length > 1 && (
                <Button
                  mode="text"
                  onPress={() => handleRemove(gasto.id)}
                  disabled={loading}
                  textColor="#E74C3C"
                >
                  Quitar
                </Button>
              )}
            </View>
          ))}

          <Button
            mode="outlined"
            onPress={handleAdd}
            style={styles.addButton}
            textColor={primary}
            disabled={loading}
          >
            Agregar otro gasto
          </Button>

          {error && (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !canSubmit}
            style={styles.primaryButton}
            contentStyle={styles.primaryButtonContent}
            labelStyle={styles.primaryButtonLabel}
            buttonColor={primary}
          >
            Guardar y seguir
          </Button>

          <Button
            mode="text"
            onPress={handleSkip}
            disabled={loading}
            style={styles.skipButton}
            textColor="#666666"
          >
            No tengo gastos fijos ahora
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  brandWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: primaryLight,
  },
  badge: {
    color: primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#555555',
    marginBottom: 16,
  },
  row: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  selectText: { color: '#1A1A1A' },
  selectPlaceholder: { color: '#999999' },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  menuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addButton: {
    marginTop: 4,
    marginBottom: 8,
    borderColor: primary,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 999,
  },
  primaryButtonContent: {
    paddingVertical: 8,
  },
  primaryButtonLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    marginTop: 12,
  },
});
