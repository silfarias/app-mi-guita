import { MovimientoModal } from '@/components/movimiento-modal';
import { useLogout } from '@/features/auth/hooks/auth.hook';
import { useAuthStore } from '@/store/auth.store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMovimientoModalVisible, setIsMovimientoModalVisible] = useState(false);
  const translateX = useSharedValue(300); // Ancho del menú (inicialmente fuera de la pantalla)
  const opacity = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.usuario?.persona?.nombre || '');
  const { logout, loading: logoutLoading } = useLogout();

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);

    if (newState) {
      // Abrir menú - animación rápida y fluida
      translateX.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0.5, { duration: 200 });
    } else {
      // Cerrar menú - animación rápida y fluida
      translateX.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  };

  const closeMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      translateX.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  };

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
        {/* Header con botón hamburguesa */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={styles.title}>
              Hola, {user}
            </Text>
            <IconButton
              icon="menu"
              size={28}
              onPress={toggleMenu}
              style={styles.menuButton}
            />
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <Button
            mode="contained"
            onPress={() => setIsMovimientoModalVisible(true)}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}
            labelStyle={styles.createButtonLabel}
          >
            Crear Movimiento
          </Button>
        </View>

      {/* Backdrop oscuro */}
      {isMenuOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </TouchableWithoutFeedback>
      )}

      {/* Menú lateral */}
      {isMenuOpen && (
      <Animated.View style={[styles.menu, menuAnimatedStyle, { paddingTop: insets.top }]}>
        <View style={styles.menuHeader}>
          <Text variant="headlineSmall" style={styles.menuTitle}>
            Opciones
          </Text>
          <TouchableOpacity onPress={closeMenu} style={styles.closeButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="window-close" size={28} color="#333333" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContent}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              closeMenu();
              router.push('/profile' as any);
            }}
          >
            <MaterialCommunityIcons name="account-circle" size={24} color="#333333" style={styles.menuIcon} />
            <Text variant="bodyLarge" style={styles.menuItemText}>Mi perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={closeMenu}>
            <MaterialCommunityIcons name="swap-horizontal" size={24} color="#333333" style={styles.menuIcon} />
            <Text variant="bodyLarge" style={styles.menuItemText}>Mis transacciones</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              closeMenu();
              logout();
            }}
            disabled={logoutLoading}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" style={styles.menuIcon} />
            <Text variant="bodyLarge" style={[styles.menuItemText, styles.logoutText]}>
              {logoutLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      )}

      {/* Modal de Crear Movimiento */}
      <MovimientoModal
        visible={isMovimientoModalVisible}
        onDismiss={() => setIsMovimientoModalVisible(false)}
        onSuccess={() => {
          // Aquí puedes agregar lógica adicional después de crear el movimiento
          // Por ejemplo, refrescar la lista de movimientos
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#333333',
  },
  menuButton: {
    margin: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createButton: {
    borderRadius: 12,
    shadowColor: '#6CB4EE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    color: '#666666',
    textAlign: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuTitle: {
    fontWeight: 'bold',
    color: '#333333',
  },
  menuContent: {
    flex: 1,
    paddingTop: 16,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    backgroundColor: 'transparent',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    color: '#333333',
    flex: 1,
  },
  logoutText: {
    color: '#D32F2F',
  },
});
