import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import StandardHeader from '../components/StandardHeader';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

export default function ArgosBotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Eu sou o Argos Bot, seu assistente de segurança IoT. Como posso ajudá-lo hoje?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll para a última mensagem
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simular resposta da IA
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText.trim());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Respostas baseadas em palavras-chave
    if (input.includes('ajuda') || input.includes('help')) {
      return 'Posso ajudá-lo com:\n• Status dos dispositivos\n• Configurações de segurança\n• Análise de logs\n• Recomendações de proteção\n• Comandos de dispositivos\n\nO que você gostaria de saber?';
    }
    
    if (input.includes('dispositivo') || input.includes('device')) {
      return 'Para verificar o status dos seus dispositivos, vá para a tela principal. Lá você encontrará uma lista completa de todos os dispositivos conectados e seu status de proteção.';
    }
    
    if (input.includes('segurança') || input.includes('security') || input.includes('proteção')) {
      return 'O sistema IOTRAC oferece:\n• Proteção em tempo real contra ataques\n• Monitoramento contínuo de comandos\n• Detecção de anomalias\n• Bloqueio automático de atividades suspeitas\n• Logs detalhados de todas as atividades';
    }
    
    if (input.includes('log') || input.includes('registro')) {
      return 'Os logs do sistema estão disponíveis na tela "Logs do Sistema". Você pode acessar logs básicos e avançados com filtros e atualização em tempo real.';
    }
    
    if (input.includes('ataque') || input.includes('attack') || input.includes('vulnerabilidade')) {
      return 'O sistema detecta automaticamente:\n• Tentativas de acesso não autorizado\n• Comandos suspeitos\n• Padrões anômalos de comportamento\n• Ameaças conhecidas\n\nTodas as ameaças são bloqueadas em tempo real.';
    }
    
    if (input.includes('configuração') || input.includes('config') || input.includes('setting')) {
      return 'As configurações principais podem ser ajustadas através da interface principal. Para configurações avançadas, consulte a documentação técnica ou entre em contato com o suporte.';
    }
    
    if (input.includes('status') || input.includes('estado')) {
      return 'Para verificar o status geral do sistema:\n• Vá para a tela principal\n• Verifique os indicadores de proteção\n• Monitore os logs em tempo real\n• Observe as estatísticas de segurança';
    }
    
    if (input.includes('oi') || input.includes('olá') || input.includes('hello')) {
      return 'Olá! Como posso ajudá-lo com a segurança dos seus dispositivos IoT hoje?';
    }
    
    // Resposta padrão
    return 'Entendo sua pergunta. Para obter informações mais específicas sobre segurança IoT, posso ajudá-lo com:\n\n• Monitoramento de dispositivos\n• Análise de ameaças\n• Configurações de proteção\n• Relatórios de segurança\n\nComo posso ser mais útil?';
  };

  const handleQuickAction = (action: string) => {
    const quickMessage = `Gostaria de saber sobre: ${action}`;
    setInputText(quickMessage);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header padrão com barra azul e logo IOTRAC */}
      <StandardHeader title="Argos Bot" />
      
      {/* Mensagens */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.botMessage,
            ]}
          >
            {!message.isUser && (
              <View style={styles.botMessageAvatar}>
                <Ionicons name="hardware-chip" size={20} color={Colors.primary} />
              </View>
            )}
            
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.botMessageText,
                ]}
              >
                {message.text}
              </Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        ))}
        
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.botMessageAvatar}>
              <Ionicons name="hardware-chip" size={20} color={Colors.primary} />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.typingText}>Argos está digitando...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Ações Rápidas */}
      <View style={styles.quickActions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('status dos dispositivos')}
          >
            <Text style={styles.quickActionText}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('configurações de segurança')}
          >
            <Text style={styles.quickActionText}>Segurança</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('logs do sistema')}
          >
            <Text style={styles.quickActionText}>Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('ajuda')}
          >
            <Text style={styles.quickActionText}>Ajuda</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input de Mensagem */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? '#fff' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickActionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
}); 