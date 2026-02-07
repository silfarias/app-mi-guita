import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Text } from 'react-native-paper';

export interface CardActionItem {
  key: string;
  title: string;
  leadingIcon: string;
  onPress: () => void;
  /** Si true, el título se muestra en rojo (ej. Eliminar). */
  destructive?: boolean;
}

export interface CardActionsMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onOpen: () => void;
  actions: CardActionItem[];
  /** Nodo que actúa como anchor (ej. botón de tres puntos). Si no se pasa, se usa un botón por defecto. */
  anchor?: React.ReactNode;
}

export function CardActionsMenu({
  visible,
  onDismiss,
  onOpen,
  actions,
  anchor,
}: CardActionsMenuProps) {
  const defaultAnchor = (
    <TouchableOpacity onPress={(e) => { e.stopPropagation(); onOpen(); }} style={styles.menuButton}>
      <MaterialCommunityIcons name="dots-vertical" size={24} color="#666666" />
    </TouchableOpacity>
  );

  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={anchor ?? defaultAnchor}
      contentStyle={styles.menuContent}
    >
      {actions.map((item) => (
        <Menu.Item
          key={item.key}
          onPress={() => {
            onDismiss();
            item.onPress();
          }}
          title={item.title}
          leadingIcon={item.leadingIcon as any}
          titleStyle={item.destructive ? styles.destructiveItem : undefined}
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 2,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
  },
  destructiveItem: {
    color: '#E74C3C',
  },
});
