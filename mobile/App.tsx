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
import { PageTransition } from './src/components/Common/PageTransition';
import { AppIntroTutorial } from './src/components/Onboarding/AppIntroTutorial';
import { colors } from './src/theme/colors';
import { autoDiscoverBackend } from './src/services/api';

const WEB_FRAME_WIDTH = 460;

export default function App() {
  const activeTab = useNavigationStore(s => s.activeTab);
  const routingData = useNavigationStore(s => s.routingData);
  const routesError = useNavigationStore(s => s.routesError);
  const isLoadingRoutes = useNavigationStore(s => s.isLoadingRoutes);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const { width, height } = useWindowDimensions();
  const isFramed = Platform.OS === 'web' && width > WEB_FRAME_WIDTH;

  useEffect(() => {
    // Auto-discover and connect to local laptop backend with 0 manual steps
    autoDiscoverBackend().catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'trafficiq-global-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          body, html, #root {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #04070D;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            user-select: none;
          }
          ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.18);
            border-radius: 4px;
          }
          .leaflet-control-attribution {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

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
      <View style={styles.outerWrapper}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View
            style={[
              styles.appContainer,
              isFramed && styles.appContainerFramed
            ]}
          >
            {/* Navigation Status Header */}
            <Header />

            {/* Active Screen View with Smooth Page Transition */}
            <View style={styles.mainContent}>
              <PageTransition activeTab={activeTab}>
                {activeScreen}
              </PageTransition>
            </View>

            {/* Floating Tactile Bottom Tab Bar */}
            <TabBar />

            {/* Fresh Start Intro & Feature Tutorial Onboarding */}
            <AppIntroTutorial />
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#04070D',
    justifyContent: 'center',
    alignItems: 'center'
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  appContainerFramed: {
    maxWidth: WEB_FRAME_WIDTH,
    maxHeight: 900,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32
  },
  mainContent: {
    flex: 1,
    position: 'relative'
  }
});
