import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SlidersHorizontal, Home, Briefcase, Plus, MapPin, Sparkles, Navigation } from 'lucide-react-native';
import { PreferenceSelector } from '../components/Profile/PreferenceSelector';
import { SystemDiagnostics } from '../components/Profile/SystemDiagnostics';
import { Card } from '../components/Common/Card';
import { useNavigationStore } from '../store/navigationStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const SAVED_PLACES = [
  { id: 'home', title: 'Home', address: 'Palm Beach Road, Navi Mumbai', corridorId: 'vashi-dadar', icon: Home },
  { id: 'work', title: 'Work / BKC Office', address: 'Bandra Kurla Complex, Mumbai', corridorId: 'thane-bkc', icon: Briefcase }
];

export const ProfileScreen: React.FC = () => {
  const setSelectedCorridor = useNavigationStore(s => s.setSelectedCorridor);
  const setActiveTab = useNavigationStore(s => s.setActiveTab);

  const handleNavigateToPlace = (corridorId: string) => {
    setSelectedCorridor(corridorId);
    setActiveTab('navigate');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.screenHeader}>
        <View style={styles.titleRow}>
          <SlidersHorizontal size={18} color={colors.primary} />
          <Text style={styles.titleText}>Driver Hub</Text>
        </View>
        <Text style={styles.subText}>
          Vehicle profiles, saved places & navigation preferences
        </Text>
      </View>

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
