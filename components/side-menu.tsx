import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ImageSourcePropType, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface SideMenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  textColor?: string;
  iconColor?: string;
  /** Si se define, se muestra Avatar.Image en lugar del icono (ej. para "Mi perfil") */
  avatarSource?: ImageSourcePropType;
}

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  items: SideMenuItem[];
  title?: string;
}

export function SideMenu({ visible, onClose, items, title = 'Opciones' }: SideMenuProps) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(300);
  const opacity = useSharedValue(0);

  // Animar cuando cambia la visibilidad
  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0.5, { duration: 200 });
    } else {
      translateX.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

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

  if (!visible) return null;

  return (
    <>
      {/* Backdrop oscuro */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
      </TouchableWithoutFeedback>

      {/* Menú lateral */}
      <Animated.View style={[styles.menu, menuAnimatedStyle, { paddingTop: insets.top }]}>
        <View style={styles.menuHeader}>
          <Text variant="headlineSmall" style={styles.menuTitle}>
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="window-close" size={28} color="#333333" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContent}>
          {items.map((item, index) => (
          
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              disabled={item.disabled || item.loading}
            >
              {item.avatarSource ? (
                <Avatar.Image
                  size={40}
                  source={item.avatarSource}
                  style={styles.menuAvatar}
                />
              ) : (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={24}
                  color={item.iconColor || '#333333'}
                  style={styles.menuIcon}
                />
              )}
              <Text
                variant="bodyLarge"
                style={[
                  styles.menuItemText,
                  item.textColor && { color: item.textColor },
                  (item.disabled || item.loading) && styles.menuItemDisabled,
                ]}
              >
                {item.loading ? 'Cargando...' : item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
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
  menuAvatar: {
    marginRight: 16,
  },
  menuItemText: {
    color: '#333333',
    flex: 1,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
});
