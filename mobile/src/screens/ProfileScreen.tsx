import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { SlidersHorizontal, Home, Briefcase, Plus, MapPin, Sparkles, Navigation, BookOpen, RotateCcw, Compass, ChevronRight, Play } from 'lucide-react-native';
import { PreferenceSelector } from '../components/Profile/PreferenceSelector';
import { SystemDiagnostics } from '../components/Profile/SystemDiagnostics';
import { Card } from '../components/Common/Card';
import { useNavigationStore } from '../store/navigationStore';
import { useSettingsStore } from '../store/settingsStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const SAVED_PLACES = [
  { id: 'ahmedabad', title: 'Tech Hub Commute', address: 'SG Highway → Infocity, Gandhinagar', corridorId: 'ahmedabad_gandhinagar', icon: Briefcase },
  { id: 'singapore', title: 'Singapore Airport Express', address: 'Marina Bay CBD → Changi Airport (SIN)', corridorId: 'singapore_changi_cbd', icon: Navigation }
];

export const ProfileScreen: React.FC = () => {
  const setSelectedCorridor = useNavigationStore(s => s.setSelectedCorridor);
  const setActiveTab = useNavigationStore(s => s.setActiveTab);
  const setShowOnboardingTutorial = useSettingsStore(s => s.setShowOnboardingTutorial);
  const resetOnboarding = useSettingsStore(s => s.resetOnboarding);

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

  const handleNavigateToPlace = (corridorId: string) => {
    setSelectedCorridor(corridorId);
    setActiveTab('navigate');
  };

  const handleReplayTutorial = () => {
    setShowOnboardingTutorial(true);
  };

  const handleFreshStart = () => {
    resetOnboarding();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <Animated.View style={[styles.screenHeader, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
          <View style={styles.titleRow}>
            <SlidersHorizontal size={18} color={colors.primary} />
            <Text style={styles.titleText}>Driver Hub</Text>
          </View>
          <Text style={styles.subText}>
            Vehicle profiles, saved places & navigation preferences
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: cardsAnim, transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
          {/* Interactive Feature Guide & App Tutorial Card */}
          <Card style={styles.tutorialCard}>
            <View style={styles.tutorialHeader}>
              <View style={styles.tutorialHeaderLeft}>
                <View style={styles.tutorialIconBox}>
                  <Sparkles size={16} color={colors.primaryBright} />
                </View>
                <View>
                  <View style={styles.tutorialTitleRow}>
                    <Text style={styles.tutorialTitle}>APP INTRO & FEATURE TUTORIAL</Text>
                    <View style={styles.guideBadge}>
                      <Text style={styles.guideBadgeText}>6 Modules</Text>
                    </View>
                  </View>
                  <Text style={styles.tutorialSub}>
                    Interactive guide to AI Routing, HUD, Alerts & Copilot
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tutorialActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleReplayTutorial}
                style={styles.tutorialPlayBtn}
                accessibilityRole="button"
                accessibilityLabel="Launch interactive app tutorial"
              >
                <Play size={13} color={colors.text.onAccent} fill={colors.text.onAccent} />
                <Text style={styles.tutorialPlayBtnText}>Open Feature Tutorial</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleFreshStart}
                style={styles.freshStartBtn}
                accessibilityRole="button"
                accessibilityLabel="Make fresh start and reset onboarding"
              >
                <RotateCcw size={13} color={colors.text.secondary} />
                <Text style={styles.freshStartBtnText}>Fresh Start</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Saved Places Shortcuts */}
          <Card style={styles.placesCard}>
            <View style={styles.placesHeader}>
              <View style={styles.placesHeaderLeft}>
                <View style={styles.iconCircle}>
                  <MapPin size={14} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.placesTitle}>SAVED PLACES & FREQUENT COMMUTES</Text>
                  <Text style={styles.placesSub}>Quick-launch navigation to frequent spots</Text>
                </View>
              </View>
            </View>

            <View style={styles.placesList}>
              {SAVED_PLACES.map(place => {
                const Icon = place.icon;
                return (
                  <TouchableOpacity
                    key={place.id}
                    activeOpacity={0.75}
                    onPress={() => handleNavigateToPlace(place.corridorId)}
                    style={styles.placeItem}
                  >
                    <View style={styles.placeIcon}>
                      <Icon size={16} color={colors.primary} />
                    </View>
                    <View style={styles.placeTextCol}>
                      <Text style={styles.placeTitle}>{place.title}</Text>
                      <Text style={styles.placeAddress}>{place.address}</Text>
                    </View>
                    <View style={styles.navButton}>
                      <Navigation size={13} color={colors.text.onAccent} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Multi-Objective Routing Profile & Vehicle Mode */}
          <PreferenceSelector />

          {/* Driver Audio & Safety Alerts */}
          <SystemDiagnostics />
        </Animated.View>
      </View>
    </ScrollView>
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
    marginBottom: spacing.lg
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
  subText: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1
  },
  tutorialCard: {
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    borderRadius: spacing.radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10
  },
  tutorialHeader: {
    marginBottom: spacing.md
  },
  tutorialHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  tutorialIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tutorialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  tutorialTitle: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.6
  },
  guideBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.primaryBorder
  },
  guideBadgeText: {
    fontSize: 8.5,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright
  },
  tutorialSub: {
    fontSize: 10.5,
    color: colors.text.secondary,
    marginTop: 2
  },
  tutorialActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  tutorialPlayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  },
  tutorialPlayBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent
  },
  freshStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  freshStartBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  placesCard: {
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    borderRadius: spacing.radius.xl
  },
  placesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  placesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placesTitle: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  placesSub: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1
  },
  placesList: {
    gap: spacing.xs
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  placeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  placeTextCol: {
    flex: 1
  },
  placeTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  placeAddress: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
