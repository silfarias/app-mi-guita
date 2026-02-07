import { View } from 'react-native';
import { Text } from 'react-native-paper';

export interface FormErrorBlockProps {
  message: string;
  style?: object;
  textStyle?: object;
}

const defaultContainerStyle = {
  marginTop: 8,
  marginBottom: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: '#FFEBEE',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#FFCDD2',
};
const defaultTextStyle = { color: '#C62828', textAlign: 'center' };

export function FormErrorBlock(p: FormErrorBlockProps) {
  const { message, style, textStyle } = p;
  return (
    <View style={[defaultContainerStyle, style]}>
      <Text variant="bodyMedium" style={[defaultTextStyle, textStyle]}>{message}</Text>
    </View>
  );
}
