import Dropdown from "@/components/Dropdown";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export default function NewDevice() {
    const [selectedValue, setSelectedValue] = useState("java");

    return (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '500', marginVertical: 16 }}>
                Vincular Dispositivo
            </Text>

            <Text style={{ marginBottom: 8 }}>
                Escolha o tipo de dispositivo que deseja vincular:
            </Text>

            <View>
                <Dropdown
                    placeholder="Selecione"
                    items={[
                        { label: 'Smart Lâmpada Wi-Fi', value: 'smart-lamp' },
                        { label: 'Fechadura Inteligente', value: 'smart-lock' },
                        { label: 'Câmera de Segurança', value: 'security-camera' },
                        { label: 'Smart TV', value: 'smart-tv' },
                        { label: 'Termostato Inteligente', value: 'smart-thermostat' }
                    ]}
                    onSelect={(value) => setSelectedValue(value)}
                />
            </View>

            <TouchableOpacity
                onPress={() => alert("Dispositivo adicionado com sucesso!")}
                style={{
                    backgroundColor: Colors.primary,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    marginTop: 16,
                    alignItems: 'center',
                }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Vincular</Text>
            </TouchableOpacity>
        </View>
    );
}