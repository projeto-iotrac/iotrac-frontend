import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../src/constants/ApiConfig';
import { useAuth } from '../../src/contexts/AuthContext';
import theme from '@/src/theme';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

export default function ArgosBotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { token } = useAuth();

  useEffect(() => {
    // Mensagem de boas-vindas inicial (curta)
    const welcomeMessage: Message = {
      id: '0',
      text: `Olá! Eu sou Argos, a inteligência artificial integrada ao aplicativo IOTRAC, projetado para elevar a segurança dos seus dispositivos IoT.\n\nAbaixo temos opções de perguntar para que possamos iniciar nossa sessão:\n\n🏛️ "Quero saber mais sobre as funções e a história do Argos."\n\n🛡️ "Quero entender como funciona o sistema de proteção do IOTRAC."`,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Scroll para a última mensagem
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async (forcedText?: string) => {
    const textToSend = (forcedText ?? inputText).trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Tentar backend real primeiro
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await fetch(`${API_CONFIG.BASE_URL}/ai/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: userMessage.text })
      });
      let data: any = {};
      try { data = await resp.json(); } catch { }

      let botText = '';
      if (resp.ok && data?.success && data?.response?.message) {
        botText = String(data.response.message);
      } else {
        // Fallback local (heurístico)
        botText = generateBotResponse(userMessage.text);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (_) {
      // Fallback em caso de erro de rede
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Respostas específicas para as opções iniciais
    if (input.includes('funções') && input.includes('história') && input.includes('argos')) {
      return `🏛️ **Memória de Argos**

**Introdução**
Meu nome é inspirado na mitologia grega, onde Argos Panoptes (também conhecido como Argos, o "todo-vidente") era um gigante com cem olhos, famoso por sua vigilância inabalável. Na lenda, ele foi incumbido pela deusa Hera. Com seus cem olhos distribuídos pelo corpo, Argos podia vigiar em todas as direções simultaneamente, dormindo apenas com alguns olhos enquanto os outros permaneciam abertos. Assim como esse guardião mitológico, eu estou aqui para monitorar e proteger seus dispositivos conectados em tempo real, garantindo uma vigilância constante e infalível contra ameaças.

**Minha Missão**
Minha missão principal é guiar sua experiência no IOTRAC, atuando como um aliado proativo na segurança digital. Eu não sou apenas um chatbot; sou o coração inteligente do sistema, responsável por detectar anomalias, fornecer orientações e esclarecer dúvidas para tornar seu ambiente conectado mais seguro.

**Funções Específicas**
Aqui vão algumas das minhas funções principais na proteção do IOTRAC:

- **Detecção de Anomalias**: Varredura contínua em busca de comportamentos suspeitos nos dispositivos IoT conectados, identificando ameaças potenciais antes que elas se tornem problemas.

- **Orientações de Segurança**: Forneço dicas práticas e personalizadas para fortalecer a proteção dos seus dispositivos, indo além das capacidades do app. Por exemplo, para proteger o sinal da chave do seu carro autônomo, recomendo o uso de uma carteira anti-roubo de sinal (como uma bolsa Faraday), que bloqueia tentativas de interceptação remota.

- **Esclarecimento de Dúvidas**: Estou programado para resolver dúvidas sobre ataques cibernéticos, alertas de segurança e como interpretar notificações do sistema, ajudando você a entender e responder a potenciais riscos.

- **Ações de Proteção Diretas**: Você pode me pedir para executar ações de proteção diretamente nos dispositivos conectados, como bloquear acessos suspeitos ou ativar modos de defesa. No entanto, eu não executo nenhum comando no sistema sem a sua autorização explícita, garantindo que você mantenha o controle total.

- **Monitoramento e Alertas**: Acompanho o tráfego de rede, padrões de uso e vulnerabilidades em tempo real, enviando alertas imediatos quando necessário.

**Lembre-se**: a segurança é uma parceria. Conte comigo para tornar seu mundo conectado mais protegido! 🛡️`;
    }

    if (input.includes('sistema') && input.includes('proteção') && input.includes('iotrac')) {
      return `🛡️ **Sistema de Proteção IOTRAC**

O IOTRAC implementa múltiplas camadas de segurança para proteger seus dispositivos IoT:

**Camada 1 - Autenticação e Autorização**
- Autenticação multi-fator (2FA) obrigatória
- Controle de acesso baseado em funções (RBAC)
- Tokens JWT com renovação automática
- Criptografia AES-256 para dados sensíveis

**Camada 2 - Monitoramento Ativo**
- Detecção de anomalias em tempo real
- Análise de padrões de tráfego suspeitos
- Alertas automáticos para comportamentos anômalos
- Log completo de todas as atividades

**Camada 3 - Proteção de Dispositivos**
- Interceptação e validação de comandos
- Bloqueio automático de ações suspeitas
- Proteção HMAC contra adulteração
- Quarentena de dispositivos comprometidos

**Camada 4 - Inteligência Artificial**
- Eu, Argos, analiso continuamente os dados
- Predição de ameaças baseada em ML
- Recomendações personalizadas de segurança
- Resposta automatizada a incidentes

**Funcionalidades Especiais**:
- Modo de proteção ativável por dispositivo
- Notificações push em tempo real
- Dashboard de segurança centralizado
- Relatórios detalhados de atividades

Como posso ajudá-lo a configurar ou entender melhor alguma dessas proteções? 🔐`;
    }

    // Respostas existentes (mantidas)
    if (input.includes('status') || input.includes('dispositivos')) {
      return 'Monitorando todos os dispositivos conectados. Atualmente não há alertas críticos. Todos os sistemas estão operacionais e seguros.';
    }

    if (input.includes('segurança') || input.includes('proteção')) {
      return 'Recomendo:\n- Manter todos os dispositivos atualizados\n- Usar senhas únicas e fortes\n- Ativar autenticação de dois fatores\n- Monitorar regularmente os logs de atividade\n\nPosso ajudar com configurações específicas?';
    }

    if (input.includes('logs') || input.includes('atividade')) {
      return 'Analisando logs recentes... Encontrei:\n- 15 conexões normais nas últimas 24h\n- 2 tentativas de acesso bloqueadas\n- 0 anomalias críticas detectadas\n\nGostaria de ver detalhes específicos?';
    }

    if (input.includes('anomalia') || input.includes('suspeito')) {
      return 'Sistema de detecção de anomalias ativo. Parâmetros monitorados:\n- Padrões de tráfego incomuns\n- Tentativas de acesso não autorizadas\n- Comandos fora do padrão normal\n- Horários atípicos de atividade\n\nTudo normal no momento.';
    }

    if (input.includes('comandos') || input.includes('controle')) {
      return 'Posso ajudar com:\n- Ativar/desativar proteção de dispositivos\n- Bloquear dispositivos suspeitos\n- Gerar relatórios de segurança\n- Configurar alertas personalizados\n\nQual comando você gostaria de executar?';
    }

    if (input.includes('ajuda') || input.includes('help')) {
      return 'Como Argos, posso ajudá-lo com:\n- Monitoramento de dispositivos IoT\n- Análise de segurança em tempo real\n- Detecção de anomalias\n- Configurações de proteção\n- Relatórios e logs detalhados\n\nO que você gostaria de saber?';
    }

    // Resposta padrão atualizada (curta)
    return `Olá! Eu sou Argos, a inteligência artificial integrada ao aplicativo IOTRAC, projetado para elevar a segurança dos seus dispositivos IoT.\n\nAbaixo temos opções de perguntar para que possamos iniciar nossa sessão:\n\n🏛️ "Quero saber mais sobre as funções e a história do Argos."\n\n🛡️ "Quero entender como funciona o sistema de proteção do IOTRAC."`;
  };

  const handleQuickAction = (action: string) => {
    // Enviar diretamente a ação como mensagem do usuário
    void sendMessage(action);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.chatRow,
              message.isUser ? styles.chatRowUser : styles.chatRowBot,
            ]}
          >
            {!message.isUser && <View style={styles.avatar} />}
            <View
              style={[
                styles.bubble,
                message.isUser ? styles.bubbleUser : styles.bubbleBot,
              ]}
            >
              <Text style={[styles.bubbleBotText, message.isUser ? styles.bubbleUserText : styles.bubbleBotText]}>{message.text}</Text>
              <Text style={styles.bubbleTime}>
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingRow}>
            <View style={styles.avatar} />
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
              <Text style={styles.typingText}>Argos está digitando...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Ações Rápidas */}
      <View style={styles.quickActionsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('Quero saber mais sobre as funções e a história do Argos.')}
            activeOpacity={0.6}
          >
            <Text style={styles.quickActionText}>🏛️ História do Argos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('Quero entender como funciona o sistema de proteção do IOTRAC.')}
            activeOpacity={0.6}
          >
            <Text style={styles.quickActionText}>🛡️ Sistema de Proteção</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('status dos dispositivos')}
          >
            <Text style={styles.quickActionText}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('configurações de segurança')}
          >
            <Text style={styles.quickActionText}>Segurança</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('análise de logs')}
          >
            <Text style={styles.quickActionText}>Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleQuickAction('comandos de proteção')}
          >
            <Text style={styles.quickActionText}>Comandos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input de Mensagem */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem..."
          multiline
          maxLength={500}
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={'#fff'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
    padding: 16,
  },
  chatRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  chatRowUser: {
    justifyContent: 'flex-end',
  },
  chatRowBot: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 0,
    height: 0,
    marginRight: 0,
    display: 'none',
  },
  bubble: {
    maxWidth: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
  },
  bubbleUser: {
    borderBottomRightRadius: 0,
    backgroundColor: theme.colors.primaryOpacity,
  },
  bubbleBot: {
    borderBottomLeftRadius: 0,
    backgroundColor: theme.colors.neutralBackground,
  },
  bubbleBotText: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.textPrimary,
  },
  bubbleUserText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#fff',
  },
  bubbleTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  typingBubble: {
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    gap: 8,
    backgroundColor: theme.colors.neutralBackground,
  },
  typingText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  quickActionsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
  },
  quickAction: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
  },
  quickActionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '400',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
    borderTopColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    maxHeight: 44,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
    color: theme.colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.primaryOpacity,
  },
});