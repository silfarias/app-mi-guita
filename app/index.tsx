import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthStore } from '@/store/auth.store';

/**
 * Pantalla de entrada: espera a que el store de auth se rehidrate y redirige
 * a login (si no hay sesión) o a (tabs) (si ya está autenticado).
 * Así la primera pantalla que ve el usuario es login cuando no hay sesión,
 * y no se ejecutan llamadas a la API sin token.
 */
export default function IndexScreen() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    setReady(true);
  }, [hasHydrated]);

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6CB4EE" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
