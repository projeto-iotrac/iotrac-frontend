import React from "react";
import { StyleSheet, TouchableOpacity, Text, useWindowDimensions, ViewStyle } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import theme from "../theme";

type BtnClass =
    | 'buttonPrimary'
    | 'buttonSecondary'
    | 'buttonDisabled'
    | 'buttonDelete'
    | 'buttonEnd';

interface ButtonProps {
    text?: string;
    btnClass?: BtnClass | BtnClass[];
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    text,
    icon,
    btnClass = "buttonPrimary",
    onPress,
    disabled,
}) => {
    const { width } = useWindowDimensions();

    const btnClasses = Array.isArray(btnClass) ? btnClass : [btnClass];

    const isDelete = btnClasses.includes("buttonDelete");
    const iconColor = isDelete ? Colors.error : "#FFF";
    const textColor = isDelete ? Colors.error : "#FFF";

    const buttonStyles: (ViewStyle | undefined)[] = [
        styles.button,
        ...btnClasses.map(c => styles[c]),
        disabled ? styles.buttonDisabled : undefined,
        btnClasses.includes('buttonEnd') ? { width: width - 32 } : undefined,
    ];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={buttonStyles}
        >
            {icon && (
                <Ionicons name={icon} style={[styles.buttonIcon, { color: iconColor }]} />
            )}
            {text && (
                <Text style={[styles.buttonText, { color: textColor }]}>{text}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 4,
        gap: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonEnd: {
        position: 'absolute',
        bottom: 16,
    },
    buttonPrimary: {
        backgroundColor: theme.colors.primary,
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
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        height: 38,
        lineHeight: 20,
    },
    buttonIcon: {
        color: '#FFF',
        fontSize: 20,
    },
});

export default Button;