import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreenComponent: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Parallel entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade in text
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // Wait 1 second then transition into main application
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(onFinish);
        }, 1000);
      });
    });
  }, [fadeAnim, scaleAnim, textFadeAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.contentBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="storefront-outline" size={64} color="#F97316" />
        </View>

        <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
          <Text variant="headlineMedium" style={styles.title}>
            Ram Stores POS
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Smart Billing & Inventory Management
          </Text>
          <ActivityIndicator animating size="small" color="#F97316" style={{ marginTop: 20 }} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentBox: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  title: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 26,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 6,
    fontSize: 14,
  },
});
