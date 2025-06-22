import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface ButtonProps {
    text?: string;
    btnClass?: 'buttonPrimary' | 'buttonSecondary' | 'buttonDisabled' | 'buttonDelete';
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ text, icon, btnClass = "buttonPrimary", onPress, disabled }) => {
    let iconColor = "#FFF";
    let textColor = "#FFF";
    
    switch (btnClass) {
        case "buttonDelete":
            iconColor = Colors.error;
            textColor = Colors.error;
            break;
        default:
            break;
    }

    return (
        <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.button, styles[btnClass], disabled && styles.buttonDisabled]}>
            {icon && (
                <Ionicons name={icon} style={[styles.buttonIcon, {color: iconColor }]} />
            )}

            {text && (
                <Text style={[styles.buttonText, {color: iconColor }]}>{text}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    buttonPrimary: {
        backgroundColor: Colors.primary,
    },
    buttonSecondary: {
        backgroundColor: Colors.primaryOpacity,
    },
    buttonDisabled: {
        backgroundColor: Colors.neutral,
    },
    buttonDelete: {
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderRadius: 8,
        backgroundColor: '#fce3e3',
        minWidth: 44,
        minHeight: 44,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonIcon: {
        color: '#FFF',
        fontSize: 20,
    },
});

export default Button;