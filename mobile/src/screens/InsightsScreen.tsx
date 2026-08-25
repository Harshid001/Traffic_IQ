import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing
} from 'react-native';
import {
  Sparkles,
  MessageSquare,
  Bot,
  User,
  Send,
  RotateCcw,
  ShieldCheck,
  Clock,
  Coins,
  AlertTriangle,
  Zap
} from 'lucide-react-native';
import { useNavigationStore } from '../store/navigationStore';
import { useSettingsStore } from '../store/settingsStore';
import { askRouteCopilot, buildRouteChatContext, ChatMessage, getEffectiveGeminiApiKey } from '../services/chatService';
import { AiLoadingIndicator } from '../components/Copilot/AiLoadingIndicator';
import { WhatIfPlanner } from '../components/Insights/WhatIfPlanner';
import { ReliabilityScorecard } from '../components/Insights/ReliabilityScorecard';
import { ProvenanceTracker } from '../components/Insights/ProvenanceTracker';
import { DataStateWrapper } from '../components/Common/DataStateWrapper';
import { InsightsSkeleton } from '../components/Common/SkeletonLoader';
import { Card } from '../components/Common/Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const QUICK_PROMPTS = [
  { id: 'why', text: 'Why is this route recommended?', icon: ShieldCheck },
  { id: 'when', text: 'Best departure time today?', icon: Clock },
  { id: 'tolls', text: 'Toll costs on this route?', icon: Coins },
  { id: 'bottlenecks', text: 'Any bottlenecks or hazards?', icon: AlertTriangle },
  { id: 'fastest', text: 'Fastest vs Recommended trade-off?', icon: Zap }
];

export const InsightsScreen: React.FC = () => {
  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const isLoadingRoutes = useNavigationStore(s => s.isLoadingRoutes);
  const routesError = useNavigationStore(s => s.routesError);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const geminiApiKey = useSettingsStore(s => s.geminiApiKey);
  const configuredModel = useSettingsStore(s => s.aiModel);
  const isCloudAiActive = Boolean(geminiApiKey || getEffectiveGeminiApiKey());
  const activeModelName = isCloudAiActive ? configuredModel || 'gemini-2.0-flash' : 'trafficiq-ai';

  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<ScrollView>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    headerAnim.setValue(0);
    cardsAnim.setValue(0);
    Animated.stagger(110, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start();
  }, [headerAnim, cardsAnim]);

  const retry = useCallback(() => fetchRoutes(selectedCorridor), [fetchRoutes, selectedCorridor]);

  const routes = routingData?.routes ?? [];
  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Initialize Copilot thread with corridor context
  useEffect(() => {
    if (selectedRoute && messages.length === 0) {
      const bestName = selectedRoute.name || 'your route';
      const eta = selectedRoute.predicted_eta_p50 ? Math.round(selectedRoute.predicted_eta_p50) : 28;
      const corridor = routingData?.corridor_name || 'Active Corridor';
      const aiBrand = isCloudAiActive ? '**Google Gemini Cloud AI**' : '**TrafficIQ Telemetry Engine**';
      const initialGreeting: ChatMessage = {
        id: 'msg-init',
        sender: 'copilot',
        text: `Hello! I'm your real-time **TrafficIQ Copilot** connected to ${aiBrand}. I have loaded live telemetry for **${corridor}** (${selectedRoute.distance_km} km, ~${eta} mins via ${bestName}). Ask me about congestion, departure timings, tolls, or route trade-offs!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: activeModelName,
        provenance: isCloudAiActive ? `GOOGLE GEMINI (${activeModelName})` : 'TRAFFICIQ TELEMETRY'
      };
      setMessages([initialGreeting]);
    }
  }, [selectedRoute, routingData, messages.length, isCloudAiActive, activeModelName]);

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend || inputQuery).trim();
      if (!query || isSending) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const currentHistory = messages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text
      }));

      setMessages(prev => [...prev, userMsg]);
      setInputQuery('');
      setIsSending(true);

      const routeContext = buildRouteChatContext(routingData, selectedRouteId);

      try {
        const res = await askRouteCopilot(
          query,
          routingData?.corridor_name,
          routeContext,
          currentHistory
        );
        const copilotMsg: ChatMessage = {
          id: `copilot-${Date.now()}`,
          sender: 'copilot',
          text: res.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.model,
          provenance: res.provenance
        };
        setMessages(prev => [...prev, copilotMsg]);
      } catch (err: any) {
        const errorMsg: ChatMessage = {
          id: `copilot-${Date.now()}`,
          sender: 'copilot',
          text: 'AI Copilot connection issue. Please check your network or configure your Gemini API Key in Profile Settings.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'offline',
          provenance: 'CONNECTION ERROR'
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsSending(false);
      }
    },
    [inputQuery, isSending, messages, routingData, selectedRouteId]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <DataStateWrapper
      isLoading={isLoadingRoutes && !selectedRoute}
      skeleton={<InsightsSkeleton />}
      error={routesError}
      errorTitle="Copilot insights unavailable"
      isEmpty={!isLoadingRoutes && !routesError && !selectedRoute}
      emptyTitle="No active trip"
      emptyMessage="Calculate a corridor to see departure planning and reliability bounds."
      emptyIcon={<Sparkles size={20} color={colors.text.secondary} />}
      isStale={!!routingData?.is_fallback && routingData?.routing_provenance !== 'DEMO'}
      lastUpdatedAt={routingData?.fetched_at}
      onRetry={retry}
      retryLabel="Retry"
    >
      {selectedRoute && (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Header */}
            <Animated.View style={[styles.screenHeader, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
              <View style={styles.titleRow}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={styles.titleText}>Driving Copilot</Text>
                <View style={styles.modelBadge}>
                  <Text style={styles.modelBadgeText}>phi4-mini</Text>
                </View>
              </View>
              <Text style={styles.subText}>
                Live neural in-car assistant grounded on active route telemetry
              </Text>
            </Animated.View>

            <Animated.View style={{ opacity: cardsAnim, transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              {/* Live Interactive AI Copilot Chat Card */}
              <Card style={styles.chatCard}>
                <View style={styles.chatCardHeader}>
                  <View style={styles.copilotHeaderLeft}>
                    <View style={styles.copilotAvatar}>
                      <Bot size={16} color={colors.primaryBright} />
                    </View>
                    <View>
                      <View style={styles.chatTitleRow}>
                        <Text style={styles.chatTitle}>REAL-TIME AI COPILOT</Text>
                        <View style={styles.livePulseDot} />
                      </View>
                      <Text style={styles.chatSubTitle}>
                        {routingData?.corridor_name || 'Active Corridor'} Context Loaded
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={resetChat}
                    style={styles.resetBtn}
                    hitSlop={spacing.hitSlop}
                    accessibilityRole="button"
                    accessibilityLabel="Reset conversation"
                  >
                    <RotateCcw size={14} color={colors.text.muted} />
                  </TouchableOpacity>
                </View>

                {/* Quick Suggestion Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickPromptsScroll}
                >
                  {QUICK_PROMPTS.map(p => {
                    const Icon = p.icon;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        activeOpacity={0.75}
                        onPress={() => handleSendMessage(p.text)}
                        disabled={isSending}
                        style={styles.quickPromptChip}
                      >
                        <Icon size={12} color={colors.primary} />
                        <Text style={styles.quickPromptText}>{p.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Message Thread Box */}
                <View style={styles.threadContainer}>
                  <ScrollView
                    ref={chatScrollRef}
                    style={styles.threadScroll}
                    contentContainerStyle={styles.threadScrollContent}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
                  >
                    {messages.map(msg => {
                      const isUser = msg.sender === 'user';
                      return (
                        <View
                          key={msg.id}
                          style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowCopilot]}
                        >
                          {!isUser && (
                            <View style={styles.botIconCircle}>
                              <Bot size={13} color={colors.primaryBright} />
                            </View>
                          )}

                          <View style={[styles.bubble, isUser ? styles.userBubble : styles.copilotBubble]}>
                            <Text style={[styles.bubbleText, isUser ? styles.userBubbleText : styles.copilotBubbleText]}>
                              {msg.text}
                            </Text>
                            <View style={styles.bubbleFooter}>
                              <Text style={styles.msgTime}>{msg.timestamp}</Text>
                              {!isUser && (
                                <Text style={styles.provenanceTag}>
                                  • {msg.provenance || 'Local phi4-mini'}
                                </Text>
                              )}
                            </View>
                          </View>

                          {isUser && (
                            <View style={styles.userIconCircle}>
                              <User size={13} color={colors.text.onAccent} />
                            </View>
                          )}
                        </View>
                      );
                    })}

                    {isSending && (
                      <AiLoadingIndicator corridorName={routingData?.corridor_name} />
                    )}
                  </ScrollView>

                  {/* Input Bar */}
                  <View style={styles.inputRow}>
                    <TextInput
                      value={inputQuery}
                      onChangeText={setInputQuery}
                      placeholder="Ask about traffic, delays, tolls, departure..."
                      placeholderTextColor={colors.text.dimmed}
                      style={styles.chatInput}
                      returnKeyType="send"
                      onSubmitEditing={() => handleSendMessage()}
                      editable={!isSending}
                    />
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSendMessage()}
                      disabled={isSending || !inputQuery.trim()}
                      style={[
                        styles.sendBtn,
                        (!inputQuery.trim() || isSending) && styles.sendBtnDisabled
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Send question to Copilot"
                    >
                      <Send size={14} color={colors.text.onAccent} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>

              {/* Smart Departure Assistant */}
              <WhatIfPlanner />

              {/* Driver On-Time Confidence Scorecard */}
              <ReliabilityScorecard route={selectedRoute} />

              {/* System Feeds & Engine Provenance */}
              <ProvenanceTracker />
            </Animated.View>
          </View>
        </ScrollView>
      )}
    </DataStateWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainer: {
    padding: spacing.cardPadding,
    paddingBottom: 110
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center'
  },
  screenHeader: {
    marginBottom: spacing.md
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  titleText: {
    fontSize: typography.sizes.h2,
    lineHeight: typography.line.h2,
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
  subText: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1
  },
  chatCard: {
    padding: 0,
    marginBottom: spacing.lg,
    borderRadius: spacing.radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primaryBorder
  },
  chatCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  copilotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  copilotAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  chatTitle: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.6
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryBright
  },
  chatSubTitle: {
    fontSize: 9.5,
    color: colors.text.muted,
    marginTop: 1
  },
  resetBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  quickPromptsScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: colors.overlaySurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  quickPromptText: {
    fontSize: 9.5,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium
  },
  threadContainer: {
    backgroundColor: colors.background
  },
  threadScroll: {
    height: 230
  },
  threadScrollContent: {
    padding: spacing.md,
    gap: spacing.sm
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs
  },
  msgRowUser: {
    justifyContent: 'flex-end'
  },
  msgRowCopilot: {
    justifyContent: 'flex-start'
  },
  botIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  userIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  copilotBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 3
  },
  userBubble: {
    backgroundColor: colors.primaryDark,
    borderBottomRightRadius: 3
  },
  bubbleText: {
    fontSize: 11,
    lineHeight: 16
  },
  copilotBubbleText: {
    color: colors.text.bright
  },
  userBubbleText: {
    color: '#FFF',
    fontWeight: typography.weights.medium
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 3
  },
  msgTime: {
    fontSize: 8.5,
    color: colors.text.dimmed
  },
  provenanceTag: {
    fontSize: 8.5,
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
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  loadingText: {
    fontSize: 10,
    color: colors.text.muted,
    fontStyle: 'italic'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    color: colors.text.primary,
    fontSize: 11
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBtnDisabled: {
    backgroundColor: colors.card,
    opacity: 0.5
  }
});

