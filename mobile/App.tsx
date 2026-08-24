import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationStore } from './src/store/navigationStore';
import { Header } from './src/components/Common/Header';
import { TabBar } from './src/components/Common/TabBar';
import { NavigateScreen } from './src/screens/NavigateScreen';
import { RoutesScreen } from './src/screens/RoutesScreen';
import { TrafficScreen } from './src/screens/TrafficScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';

/** Width at which the web layout stops stretching and becomes a centred phone frame. */
const WEB_FRAME_WIDTH = 440;

export default function App() {
  const activeTab = useNavigationStore(s => s.activeTab);
  const routingData = useNavigationStore(s => s.routingData);
  const routesError = useNavigationStore(s => s.routesError);
  const isLoadingRoutes = useNavigationStore(s => s.isLoadingRoutes);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const { width } = useWindowDimensions();
  // Only constrain the frame once the viewport is actually wider than a phone.
  const isFramed = Platform.OS === 'web' && width > WEB_FRAME_WIDTH;

  /**
   * Sole cold-start fetch. `NavigateScreen` used to run an identical effect,
   * which fired a second `/api/routes/calculate` on launch.
   */
  useEffect(() => {
    if (!routingData && !isLoadingRoutes && !routesError) {
      fetchRoutes(selectedCorridor);
    }
  }, [routingData, isLoadingRoutes, routesError, fetchRoutes, selectedCorridor]);

  const activeScreen = useMemo(() => {
    switch (activeTab) {
      case 'routes':
        return <RoutesScreen />;
      case 'traffic':
        return <TrafficScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'navigate':
      default:
        return <NavigateScreen />;
    }
  }, [activeTab]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.background} />
      {/* `edges` keeps the map flush to the bottom sheet while respecting the notch. */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View
          style={[
            styles.appContainer,
            isFramed && { maxWidth: WEB_FRAME_WIDTH, borderLeftWidth: 1, borderRightWidth: 1 }
          ]}
        >
          {/* Cockpit Status Header */}
          <Header />

          {/* Active Screen */}
          <View style={styles.mainContent}>{activeScreen}</View>

          {/* 5-Area Bottom Tab Bar */}
          <TabBar />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    alignSelf: 'center',
    borderColor: colors.border,
    position: 'relative'
  },
  mainContent: {
    flex: 1,
    position: 'relative'
  }
});
