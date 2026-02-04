import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface HeaderProps {
    title: string;
    onBack?: () => void;
}

export function Header({ title, onBack }: HeaderProps) {

    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    }

    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333333" />
                </TouchableOpacity>
                <Text variant="headlineSmall" style={styles.headerTitle}>
                    {title}
                </Text>
                <View style={styles.placeholder} />
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
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
      backButton: {
        padding: 8,
        marginLeft: -8,
      },
      headerTitle: {
        fontWeight: 'bold',
        color: '#333333',
        flex: 1,
        textAlign: 'center',
      },
      placeholder: {
        width: 40,
      },
});