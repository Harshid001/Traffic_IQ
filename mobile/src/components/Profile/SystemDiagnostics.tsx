import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, TextInput, ActivityIndicator, Platform } from 'react-native';
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Radio,
  Bell,
  Volume2,
  ShieldAlert,
  Sparkles,
  Server,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
  Cpu
} from 'lucide-react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { useNavigationStore } from '../../store/navigationStore';
import { testAiConnection, getEffectiveGeminiApiKey, testBackendConnection } from '../../services/chatService';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const HEALTH_REFRESH_MS = 30000;

const SystemDiagnosticsBase: React.FC = () => {
  const systemHealth = useSettingsStore(s => s.systemHealth);
  const refreshHealth = useSettingsStore(s => s.refreshHealth);
  const isLoadingHealth = useSettingsStore(s => s.isLoadingHealth);
  const trafficMode = useSettingsStore(s => s.trafficMode);
  const setTrafficMode = useSettingsStore(s => s.setTrafficMode);
  const backgroundAlertsEnabled = useSettingsStore(s => s.backgroundAlertsEnabled);
  const toggleBackgroundAlerts = useSettingsStore(s => s.toggleBackgroundAlerts);
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const toggleSound = useSettingsStore(s => s.toggleSound);

  const geminiApiKey = useSettingsStore(s => s.geminiApiKey);
  const setGeminiApiKey = useSettingsStore(s => s.setGeminiApiKey);
  const aiModel = useSettingsStore(s => s.aiModel);
  const aiProvider = useSettingsStore(s => s.aiProvider);
  const setAiProvider = useSettingsStore(s => s.setAiProvider);

  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const customBackendUrl = useSettingsStore(s => s.customBackendUrl);
  const setCustomBackendUrl = useSettingsStore(s => s.setCustomBackendUrl);

  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [inputUrl, setInputUrl] = useState(customBackendUrl);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [urlSaveSuccess, setUrlSaveSuccess] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [ollamaTestResult, setOllamaTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  useEffect(() => {
    setInputKey(geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    setInputUrl(customBackendUrl);
  }, [customBackendUrl]);

  const handleSaveUrl = useCallback(() => {
    setCustomBackendUrl(inputUrl);
    setUrlSaveSuccess(true);
    setBackendTestResult(null);
    setTimeout(() => setUrlSaveSuccess(false), 2500);
  }, [inputUrl, setCustomBackendUrl]);

  const handleTestBackend = useCallback(async () => {
    setIsTestingBackend(true);
    setBackendTestResult(null);
    try {
      const res = await testBackendConnection(inputUrl.trim() || undefined);
      setBackendTestResult({
        success: res.success,
        message: res.message
      });
      if (res.success) {
        refreshHealth();
      }
    } catch (e: any) {
      setBackendTestResult({
        success: false,
        message: e?.message || 'Backend connection test failed'
      });
    } finally {
      setIsTestingBackend(false);
    }
  }, [inputUrl, refreshHealth]);

  const doRefresh = useCallback(async () => {
    await refreshHealth();
    setLastCheckedAt(Date.now());
  }, [refreshHealth]);

  const doRefreshRef = useRef(doRefresh);
  doRefreshRef.current = doRefresh;

  useEffect(() => {
    doRefreshRef.current();
    const interval = setInterval(() => doRefreshRef.current(), HEALTH_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const handleTrafficModeToggle = useCallback(
    (mode: 'DEMO' | 'REAL') => {
      if (mode === trafficMode) return;
      setTrafficMode(mode);
      fetchRoutes(selectedCorridor, undefined, mode);
    },
    [trafficMode, setTrafficMode, fetchRoutes, selectedCorridor]
  );

  const handleSaveApiKey = useCallback(() => {
    setGeminiApiKey(inputKey);
    setSaveSuccess(true);
    setAiTestResult(null);
    setTimeout(() => setSaveSuccess(false), 2500);
  }, [inputKey, setGeminiApiKey]);

  const handleTestAi = useCallback(async () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await testAiConnection(inputKey.trim() || undefined, aiModel);
      setAiTestResult({
        success: res.success,
        message: res.message
      });
    } catch (e: any) {
      setAiTestResult({
        success: false,
        message: e?.message || 'Connection test failed'
      });
    } finally {
      setIsTestingAi(false);
    }
  }, [inputKey, aiModel]);

  const handleTestOllama = useCallback(async () => {
    setIsTestingOllama(true);
    setOllamaTestResult(null);
    try {
      const { testOllamaConnection } = await import('../../services/chatService');
      const res = await testOllamaConnection();
      setOllamaTestResult({
        success: res.success,
        message: res.message
      });
    } catch (e: any) {
      setOllamaTestResult({
        success: false,
        message: e?.message || 'Local Ollama test failed'
      });
    } finally {
      setIsTestingOllama(false);
    }
  }, []);

  const effectiveKey = inputKey.trim() || getEffectiveGeminiApiKey();
  const services: Record<string, string> | null = systemHealth?.services ?? null;

  return (
    <View style={styles.container}>
      {/* AI Copilot Engine Settings */}
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.fastestSoft }]}>
            <Sparkles size={14} color={colors.fastest} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>AI COPILOT INTELLIGENCE ENGINE</Text>
            <Text style={styles.subTitle}>Hybrid Zero-Server Cloud AI & Local Phi-4-mini</Text>
          </View>
          <Badge variant={effectiveKey || aiProvider === 'ollama' ? 'primary' : 'neutral'} size="sm">
            {aiProvider === 'ollama' ? 'LOCAL OLLAMA' : effectiveKey ? 'CLOUD GEMINI' : 'AUTO DETECT'}
          </Badge>
        </View>

        <View style={styles.aiCardBody}>
          {/* Provider Selection Segment */}
          <View style={styles.providerSegment}>
            <TouchableOpacity
              style={[styles.providerTab, aiProvider === 'auto' && styles.providerTabActive]}
              onPress={() => setAiProvider('auto')}
              activeOpacity={0.8}
            >
              <Text style={[styles.providerTabText, aiProvider === 'auto' && styles.providerTabTextActive]}>
                ⚡ Auto Hybrid
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.providerTab, aiProvider === 'gemini' && styles.providerTabActive]}
              onPress={() => setAiProvider('gemini')}
              activeOpacity={0.8}
            >
              <Text style={[styles.providerTabText, aiProvider === 'gemini' && styles.providerTabTextActive]}>
                ☁️ Cloud Gemini
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.providerTab, aiProvider === 'ollama' && styles.providerTabActive]}
              onPress={() => setAiProvider('ollama')}
              activeOpacity={0.8}
            >
              <Text style={[styles.providerTabText, aiProvider === 'ollama' && styles.providerTabTextActive]}>
                💻 Local Phi-4
              </Text>
            </TouchableOpacity>
          </View>

          {/* Local Ollama Status & Test Section */}
          <View style={styles.ollamaSectionBox}>
            <View style={styles.ollamaHeaderRow}>
              <View style={styles.ollamaTitleCol}>
                <Text style={styles.ollamaSectionTitle}>Local Ollama Server (Port 11434)</Text>
                <Text style={styles.ollamaSectionSub}>Powers local Phi-4-mini on your machine</Text>
              </View>
              <TouchableOpacity
                style={[styles.testOllamaBtn, isTestingOllama && styles.btnDisabled]}
                onPress={handleTestOllama}
                disabled={isTestingOllama}
                activeOpacity={0.8}
              >
                {isTestingOllama ? (
                  <ActivityIndicator size="small" color={colors.fastest} />
                ) : (
                  <>
                    <Cpu size={12} color={colors.fastest} />
                    <Text style={styles.testOllamaBtnText}>Test Ollama</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {ollamaTestResult && (
              <View
                style={[
                  styles.testResultBox,
                  ollamaTestResult.success ? styles.testResultSuccess : styles.testResultError
                ]}
              >
                {ollamaTestResult.success ? (
                  <CheckCircle2 size={14} color={colors.primary} />
                ) : (
                  <XCircle size={14} color={colors.danger} />
                )}
                <Text
                  style={[
                    styles.testResultText,
                    { color: ollamaTestResult.success ? colors.primary : colors.danger }
                  ]}
                >
                  {ollamaTestResult.message}
                </Text>
              </View>
            )}
          </View>

          {/* Remote Laptop / Public Tunnel Section (for 4G/5G mobile connection without same Wi-Fi) */}
          <View style={styles.keyInputContainer}>
            <Text style={styles.keyInputLabel}>Laptop Backend URL (Local Wi-Fi IP or Tunnel):</Text>
            <View style={styles.keyInputRow}>
              <Server size={15} color={colors.text.muted} style={styles.keyIcon} />
              <TextInput
                style={styles.keyInput}
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="e.g. http://192.168.1.147:8005 or https://your-tunnel.ngrok-free.app"
                placeholderTextColor={colors.text.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.keyActionRow}>
              <TouchableOpacity
                style={[styles.saveKeyBtn, urlSaveSuccess && styles.saveKeyBtnSuccess]}
                onPress={handleSaveUrl}
                activeOpacity={0.8}
              >
                {urlSaveSuccess ? (
                  <>
                    <CheckCircle2 size={13} color="#FFF" />
                    <Text style={styles.saveKeyBtnText}>Connected & Saved!</Text>
                  </>
                ) : (
                  <>
                    <Zap size={13} color="#FFF" />
                    <Text style={styles.saveKeyBtnText}>Save Laptop URL</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testAiBtn, isTestingBackend && styles.btnDisabled]}
                onPress={handleTestBackend}
                disabled={isTestingBackend}
                activeOpacity={0.8}
              >
                {isTestingBackend ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Server size={13} color={colors.primary} />
                    <Text style={styles.testAiBtnText}>Test Backend</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {backendTestResult && (
              <View
                style={[
                  styles.testResultBox,
                  backendTestResult.success ? styles.testResultSuccess : styles.testResultError
                ]}
              >
                {backendTestResult.success ? (
                  <CheckCircle2 size={14} color={colors.primary} />
                ) : (
                  <XCircle size={14} color={colors.danger} />
                )}
                <Text
                  style={[
                    styles.testResultText,
                    { color: backendTestResult.success ? colors.primary : colors.danger }
                  ]}
                >
                  {backendTestResult.message}
                </Text>
              </View>
            )}

            <Text style={styles.aiFooterHelp}>
              💡 Enter your laptop's Wi-Fi IP (e.g. http://192.168.X.X:8005) or public tunnel. Phone and laptop must be on the same Wi-Fi.
            </Text>
          </View>

          {/* Cloud Gemini Section */}
          <View style={styles.keyInputContainer}>
            <Text style={styles.keyInputLabel}>Google Gemini API Key (Direct Cloud AI):</Text>
            <View style={styles.keyInputRow}>
              <KeyRound size={15} color={colors.text.muted} style={styles.keyIcon} />
              <TextInput
                style={styles.keyInput}
                value={inputKey}
                onChangeText={setInputKey}
                placeholder="Enter Google Gemini API Key (AIzaSy...)"
                placeholderTextColor={colors.text.muted}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowKey(!showKey)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel="Toggle API key visibility"
              >
                {showKey ? <EyeOff size={15} color={colors.text.secondary} /> : <Eye size={15} color={colors.text.secondary} />}
              </TouchableOpacity>
            </View>

            <View style={styles.keyActionRow}>
              <TouchableOpacity
                style={[styles.saveKeyBtn, saveSuccess && styles.saveKeyBtnSuccess]}
                onPress={handleSaveApiKey}
                activeOpacity={0.8}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 size={13} color="#FFF" />
                    <Text style={styles.saveKeyBtnText}>Saved & Active!</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} color="#FFF" />
                    <Text style={styles.saveKeyBtnText}>Save Key</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testAiBtn, isTestingAi && styles.btnDisabled]}
                onPress={handleTestAi}
                disabled={isTestingAi}
                activeOpacity={0.8}
              >
                {isTestingAi ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Zap size={13} color={colors.primary} />
                    <Text style={styles.testAiBtnText}>Test Gemini</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {aiTestResult && (
              <View
                style={[
                  styles.testResultBox,
                  aiTestResult.success ? styles.testResultSuccess : styles.testResultError
                ]}
              >
                {aiTestResult.success ? (
                  <CheckCircle2 size={14} color={colors.primary} />
                ) : (
                  <XCircle size={14} color={colors.danger} />
                )}
                <Text
                  style={[
                    styles.testResultText,
                    { color: aiTestResult.success ? colors.primary : colors.danger }
                  ]}
                >
                  {aiTestResult.message}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>


      {/* Audio & Alert Preferences */}
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Bell size={14} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>DRIVER ALERTS & AUDIO</Text>
            <Text style={styles.subTitle}>Voice guidance, hazard alarms & background alerts</Text>
          </View>
        </View>

        <View style={styles.switchGroup}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Voice Navigation Guidance</Text>
              <Text style={styles.switchSub}>Turn-by-turn spoken directions and street names</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchDivider} />

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Proactive Delay & Reroute Alerts</Text>
              <Text style={styles.switchSub}>Notify when a faster alternate route saves 5+ mins</Text>
            </View>
            <Switch
              value={backgroundAlertsEnabled}
              onValueChange={toggleBackgroundAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>
      </Card>

      {/* Traffic Data Stream Source */}
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Radio size={14} color={colors.info} />
          </View>
          <View>
            <Text style={styles.title}>LIVE TRAFFIC SOURCE</Text>
            <Text style={styles.subTitle}>TomTom live highway telemetry vs offline simulation</Text>
          </View>
        </View>

        <View style={styles.modeGrid}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleTrafficModeToggle('REAL')}
            style={[styles.modeCard, trafficMode === 'REAL' && styles.modeCardActive]}
          >
            <View style={styles.modeHeader}>
              <View style={[styles.modeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.modeTitle, trafficMode === 'REAL' && styles.modeTitleActive]}>
                TomTom Live Stream
              </Text>
            </View>
            <Text style={styles.modeDesc}>Real-time GPS vehicle speed and live bottleneck reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleTrafficModeToggle('DEMO')}
            style={[styles.modeCard, trafficMode === 'DEMO' && styles.modeCardActive]}
          >
            <View style={styles.modeHeader}>
              <View style={[styles.modeDot, { backgroundColor: colors.fastest }]} />
              <Text style={[styles.modeTitle, trafficMode === 'DEMO' && styles.modeTitleActive]}>
                Simulated Demo Flow
              </Text>
            </View>
            <Text style={styles.modeDesc}>Curated congestion scenarios for testing and offline drives</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Engine Status Summary */}
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Server size={14} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>NAVIGATION ENGINE HEALTH</Text>
            <Text style={styles.subTitle}>FastAPI microservices & ML models</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={doRefresh}
            disabled={isLoadingHealth}
            style={styles.refreshBtn}
          >
            <RefreshCw size={12} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {services && (
          <View style={styles.serviceGrid}>
            {Object.entries(services).map(([name, status]) => {
              const isOk = /ok|healthy|online|running|active/i.test(status);
              return (
                <View key={name} style={styles.serviceCell}>
                  <View style={[styles.serviceStatusDot, { backgroundColor: isOk ? colors.primary : colors.danger }]} />
                  <Text style={styles.serviceName}>{name.toUpperCase()}</Text>
                  <Text style={[styles.serviceStatus, { color: isOk ? colors.primary : colors.danger }]}>
                    {status}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </View>
  );
};

export const SystemDiagnostics = React.memo(SystemDiagnosticsBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  card: {
    padding: spacing.cardPadding,
    borderRadius: spacing.radius.xl
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    flex: 1
  },
  title: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  subTitle: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1
  },
  refreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  aiCardBody: {
    gap: spacing.sm
  },
  providerSegment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3
  },
  providerTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radius.md
  },
  providerTabActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder
  },
  providerTabText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  providerTabTextActive: {
    color: colors.primaryBright
  },
  ollamaSectionBox: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs
  },
  ollamaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  ollamaTitleCol: {
    flex: 1
  },
  ollamaSectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  ollamaSectionSub: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1
  },
  testOllamaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.fastestSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  testOllamaBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.fastest
  },
  keyInputContainer: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs
  },
  keyInputLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginBottom: 2
  },
  keyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm
  },
  keyIcon: {
    marginRight: 6
  },
  keyInput: {
    flex: 1,
    height: 38,
    fontSize: 12,
    color: colors.text.bright,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  eyeBtn: {
    padding: 6
  },
  keyActionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2
  },
  saveKeyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.fastest,
    borderRadius: spacing.radius.md,
    height: 34,
    paddingHorizontal: spacing.sm
  },
  saveKeyBtnSuccess: {
    backgroundColor: colors.primary
  },
  saveKeyBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#000'
  },
  testAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    height: 34,
    paddingHorizontal: spacing.md
  },
  testAiBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  btnDisabled: {
    opacity: 0.6
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: spacing.radius.md,
    borderWidth: 1
  },
  testResultSuccess: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft
  },
  testResultError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger
  },
  testResultText: {
    flex: 1,
    fontSize: 11,
    fontWeight: typography.weights.medium
  },
  aiFooterHelp: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline'
  },
  switchGroup: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  switchTextCol: {
    flex: 1
  },
  switchTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  switchSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2
  },
  switchDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md
  },
  modeGrid: {
    gap: spacing.xs
  },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2
  },
  modeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  modeTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  modeTitleActive: {
    color: colors.primaryBright
  },
  modeDesc: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  serviceCell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '48%',
    flex: 1,
    gap: 5
  },
  serviceStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  serviceName: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    flex: 1
  },
  serviceStatus: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold
  }
});
