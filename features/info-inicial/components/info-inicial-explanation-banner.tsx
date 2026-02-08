import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface InfoInicialExplanationBannerProps {
  text: string;
}

export function InfoInicialExplanationBanner({ text }: InfoInicialExplanationBannerProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="information" size={20} color="#6CB4EE" />
      <Text variant="bodyMedium" style={styles.text}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  text: {
    flex: 1,
    color: '#666666',
    lineHeight: 20,
  },
});
