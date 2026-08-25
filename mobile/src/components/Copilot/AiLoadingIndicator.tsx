import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Bot } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface AiLoadingIndicatorProps {
  label?: string;
  corridorName?: string;
  compact?: boolean;
}

export const AiLoadingIndicator: React.FC<AiLoadingIndicatorProps> = ({
  label = 'Phi-4 is thinking...',
  corridorName
}) => {
  // Staggered animated values for 3 bouncing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Pulse animation for the bot icon
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle pulse on bot icon
    const iconLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(iconPulse, {
          toValue: 1.0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    iconLoop.start();

    // Helper for smooth wave dot bounce & fade
    const createDotAnimation = (val: Animated.Value, delayMs: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delayMs),
          Animated.timing(val, {
            toValue: -6,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true
          }),
          Animated.delay(600 - delayMs)
        ])
      );
    };

    const anim1 = createDotAnimation(dot1, 0);
    const anim2 = createDotAnimation(dot2, 180);
    const anim3 = createDotAnimation(dot3, 360);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      iconLoop.stop();
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3, iconPulse]);

  return (
    <View style={styles.container}>
      {/* Bot Icon with soft breathing animation */}
      <Animated.View style={[styles.botIconCircle, { transform: [{ scale: iconPulse }] }]}>
        <Bot size={13} color={colors.primaryBright} />
      </Animated.View>

      {/* Simple Clean Typing Bubble */}
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ translateY: dot1 }],
                opacity: dot1.interpolate({
                  inputRange: [-6, 0],
                  outputRange: [1, 0.45]
                })
              }
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ translateY: dot2 }],
                opacity: dot2.interpolate({
                  inputRange: [-6, 0],
                  outputRange: [1, 0.45]
                })
              }
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ translateY: dot3 }],
                opacity: dot3.interpolate({
                  inputRange: [-6, 0],
                  outputRange: [1, 0.45]
                })
              }
            ]}
          />
        </View>

        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginVertical: 4
  },
  botIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.primaryBorder
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.xl,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 14,
    paddingHorizontal: 2
  },
  dot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
    backgroundColor: colors.primaryBright
  },
  label: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: typography.weights.medium
  }
});
