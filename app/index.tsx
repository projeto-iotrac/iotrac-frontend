import Device from "@/components/Device";
import DevicesMenu from "@/components/DevicesMenu";
import { ScrollView, View } from "react-native";
import Banner from "@/components/Banner";
import React from "react";

export default function Index() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Banner source={require('../assets/images/banner.png')} />
      <View style={{ paddingHorizontal: 16 }}>
        <DevicesMenu />
        <Device title="Smart Lâmpada Wi-Fi" subtitle="Seguro" href="/device-details" />
        <Device title="Fechadura Inteligente" subtitle="Vulnerável" href="https://www.exemplo.com" />
        <Device title="Câmera de Segurança" subtitle="Sob Ataque!" href="https://www.exemplo.com" />
        <Device title="Smart TV" subtitle="Seguro" href="https://www.exemplo.com" />
        <Device title="Termostato Inteligente" subtitle="Seguro" href="https://www.exemplo.com" />
      </View>
    </ScrollView>
  );
}