import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

interface Message { id: string; text: string; isUser: boolean; timestamp: Date; }

export default function ArgosBotScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([ { id:'1', text:'Olá! Eu sou o Argos Bot. Como posso ajudar?', isUser:false, timestamp:new Date() } ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => { setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100); }, [messages]);

  const generateBotResponse = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('ajuda')) return 'Posso ajudar com status, logs e segurança.';
    if (t.includes('logs')) return 'Acesse a aba Logs para ver registros e detalhes.';
    if (t.includes('status')) return 'Verifique o status na tela inicial.';
    if (t.includes('segurança')) return 'Proteção em tempo real e detecção de anomalias ativas.';
    return 'Não entendi. Tente perguntar sobre status, logs ou segurança.';
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const user: Message = { id: Date.now().toString(), text: inputText.trim(), isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, user]);
    const response: Message = { id: (Date.now()+1).toString(), text: generateBotResponse(user.text), isUser: false, timestamp: new Date() };
    setMessages(prev => [...prev, response]);
    setInputText('');
  };

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Argos Bot</Text>
      <ScrollView ref={scrollViewRef} style={{ flex: 1, borderWidth: 1, borderColor: '#aaa', padding: 8 }}>
        {messages.map(m => (
          <View key={m.id} style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: m.isUser ? 'bold' : 'normal' }}>
              {m.isUser ? 'Você: ' : 'Argos: '}{m.text}
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{m.timestamp.toLocaleTimeString('pt-BR')}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <TextInput value={inputText} onChangeText={setInputText} placeholder="Digite..." style={{ flex: 1, borderWidth: 1, borderColor: '#aaa', padding: 8 }} />
        <TouchableOpacity onPress={sendMessage} style={{ paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1, borderColor: '#aaa' }}>
          <Text>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 