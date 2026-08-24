import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  Zap,
  HelpCircle,
  Clock,
  Coins,
  AlertTriangle,
  RotateCcw
} from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { askRouteCopilot, buildRouteChatContext, ChatMessage } from '../../services/chatService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLayout } from '../../theme/useLayout';

interface AiChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const SUGGESTED_QUERIES = [
  { id: '1', text: 'Why is this route recommended?', icon: ShieldCheck },
  { id: '2', text: 'When should I leave to avoid traffic?', icon: Clock },
  { id: '3', text: 'Are there any highway tolls on this route?', icon: Coins },
  { id: '4', text: 'Are there bottlenecks or hazards ahead?', icon: AlertTriangle }
];

export const AiChatModal: React.FC<AiChatModalProps> = ({ visible, onClose }) => {
  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const { dialogMaxWidth } = useLayout();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const routes = routingData?.routes ?? [];
  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const fastestRoute = routes.find(r => r.is_fastest) || routes[0];

  // Initialize greeting with route context
  useEffect(() => {
    if (visible && messages.length === 0) {
      const bestName = selectedRoute?.name || 'your destination';
      const eta = selectedRoute?.predicted_eta_p50 || 28;
      const initialGreeting: ChatMessage = {
        id: 'msg-0',
        sender: 'copilot',
        text: `Hello! I'm your local **TrafficIQ Copilot** powered by **Phi-4-mini**. I'm monitoring **${routingData?.corridor_name || 'your corridor'}** (~${eta} mins via ${bestName}). How can I assist your drive?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'phi4-mini'
      };
      setMessages([initialGreeting]);
    }
  }, [visible, routingData, selectedRoute, messages.length]);

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend || inputQuery).trim();
      if (!query || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMsg]);
      setInputQuery('');
      setIsLoading(true);

      const routeContext = buildRouteChatContext(routingData, selectedRouteId);

      try {
        const res = await askRouteCopilot(query, routingData?.corridor_name, routeContext);
        const copilotMsg: ChatMessage = {
          id: `copilot-${Date.now()}`,
          sender: 'copilot',
          text: res.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.model,
          provenance: res.provenance
        };
        setMessages(prev => [...prev, copilotMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: `copilot-${Date.now()}`,
          sender: 'copilot',
          text: 'Unable to reach local model right now. Recommended route remains optimal with steady travel time.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputQuery, isLoading, routingData, selectedRoute, fastestRoute]
  );

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close Copilot chat">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.modalCard, { maxWidth: Math.min(460, dialogMaxWidth) }]}
        >
          <Pressable accessible={false} style={styles.innerContainer} onPress={e => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.copilotAvatar}>
                  <Sparkles size={16} color={colors.primaryBright} />
                </View>
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>TrafficIQ Copilot</Text>
                    <View style={styles.modelBadge}>
                      <Text style={styles.modelBadgeText}>phi4-mini</Text>
                    </View>
                  </View>
                  <Text style={styles.subTitle}>Local Neural In-Car Assistant</Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={resetChat}
                  style={styles.iconBtn}
                  hitSlop={spacing.hitSlop}
                  accessibilityRole="button"
                  accessibilityLabel="Reset conversation"
                >
                  <RotateCcw size={14} color={colors.text.muted} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={onClose}
                  style={styles.iconBtn}
                  hitSlop={spacing.hitSlop}
                  accessibilityRole="button"
                  accessibilityLabel="Close Copilot chat"
                >
                  <X size={16} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Suggestion Chips */}
            <View style={styles.suggestionsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
                {SUGGESTED_QUERIES.map(q => {
                  const Icon = q.icon;
                  return (
                    <TouchableOpacity
                      key={q.id}
                      activeOpacity={0.75}
                      onPress={() => handleSend(q.text)}
                      disabled={isLoading}
                      style={styles.suggestionChip}
                    >
                      <Icon size={12} color={colors.primaryBright} />
                      <Text style={styles.suggestionText}>{q.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Messages Thread */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                return (
                  <View key={msg.id} style={[styles.messageRow, isUser ? styles.userRow : styles.copilotRow]}>
                    {!isUser && (
                      <View style={styles.botIconCircle}>
                        <Bot size={14} color={colors.primaryBright} />
                      </View>
                    )}

                    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.copilotBubble]}>
                      <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.copilotMessageText]}>
                        {msg.text}
                      </Text>
                      <View style={styles.bubbleFooter}>
                        <Text style={styles.timestamp}>{msg.timestamp}</Text>
                        {!isUser && (
                          <Text style={styles.provenanceText}>
                            • {msg.provenance ? 'Local phi4-mini' : 'Grounded AI'}
                          </Text>
                        )}
                      </View>
                    </View>

                    {isUser && (
                      <View style={styles.userIconCircle}>
                        <User size={14} color={colors.text.onAccent} />
                      </View>
                    )}
                  </View>
                );
              })}

              {isLoading && (
                <View style={styles.loadingRow}>
                  <View style={styles.botIconCircle}>
                    <Bot size={14} color={colors.primaryBright} />
                  </View>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Analyzing route via phi4-mini...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                value={inputQuery}
                onChangeText={setInputQuery}
                placeholder="Ask about traffic, delays, tolls, or arrival..."
                placeholderTextColor={colors.text.dimmed}
                style={styles.textInput}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
                editable={!isLoading}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSend()}
                disabled={isLoading || !inputQuery.trim()}
                style={[styles.sendButton, (!inputQuery.trim() || isLoading) && styles.sendButtonDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Send question"
              >
                <Send size={15} color={colors.text.onAccent} />
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md
  },
  modalCard: {
    width: '100%',
    height: 520,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.xxl,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    overflow: 'hidden'
  },
  innerContainer: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.overlaySurface
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  copilotAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  title: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  modelBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.primaryBorder
  },
  modelBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright
  },
  subTitle: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  suggestionsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background
  },
  suggestionsScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: 8
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  suggestionText: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium
  },
  messagesList: {
    flex: 1,
    backgroundColor: colors.background
  },
  messagesContent: {
    padding: spacing.cardPadding,
    gap: spacing.md
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs
  },
  userRow: {
    justifyContent: 'flex-end'
  },
  copilotRow: {
    justifyContent: 'flex-start'
  },
  botIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  userIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: spacing.radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  copilotBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4
  },
  userBubble: {
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 4
  },
  messageText: {
    fontSize: 12,
    lineHeight: 18
  },
  copilotMessageText: {
    color: colors.text.bright
  },
  userMessageText: {
    color: '#FFF',
    fontWeight: typography.weights.medium
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4
  },
  timestamp: {
    fontSize: 9,
    color: colors.text.dimmed
  },
  provenanceText: {
    fontSize: 9,
    color: colors.primaryBright,
    fontWeight: typography.weights.bold
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  loadingText: {
    fontSize: 11,
    color: colors.text.muted,
    fontStyle: 'italic'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.cardPadding,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text.primary,
    fontSize: 11
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: colors.card,
    opacity: 0.5
  }
});
