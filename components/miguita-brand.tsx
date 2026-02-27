import { Image, StyleSheet, View } from 'react-native';

export function MiGuitaBrand() {
  return (
    <View style={styles.brandContainer}>
      <Image
        source={require('../assets/logo-mi-guita.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  brandContainer: {
    alignItems: 'center',
    marginBottom: 0,
    paddingTop: 10,
  },
  logo: {
    width: 240,
    height: 240,
  },
});
