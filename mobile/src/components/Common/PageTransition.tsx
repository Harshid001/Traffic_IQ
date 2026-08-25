import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Platform, Easing } from 'react-native';
import { ActiveTab } from '../../store/navigationStore';

interface PageTransitionProps {
  activeTab: ActiveTab;
  children: React.ReactNode;
}

const TAB_INDEX_MAP: Record<ActiveTab, number> = {
  navigate: 0,
  routes: 1,
  traffic: 2,
  insights: 3,
  profile: 4
};

export const PageTransition: React.FC<PageTransitionProps> = ({ activeTab, children }) => {
  const prevTabRef = useRef<ActiveTab>(activeTab);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    const prevIndex = TAB_INDEX_MAP[prevTabRef.current] ?? 0;
    const nextIndex = TAB_INDEX_MAP[activeTab] ?? 0;
    const direction = nextIndex >= prevIndex ? 1 : -1;
    prevTabRef.current = activeTab;

    // Reset values for entrance
    const initialSlide = direction * 16;
    slideAnim.setValue(initialSlide);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.985);

    // Parallel smooth entrance transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start();
  }, [activeTab, fadeAnim, slideAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  }
});
