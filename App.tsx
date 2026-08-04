import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';

import { store, useAppDispatch } from './src/store';
import { fetchSettings } from './src/store/settingsSlice';
import { fetchProducts } from './src/store/billingSlice';
import { fetchInvoices } from './src/store/invoiceSlice';
import { TabNavigator } from './src/navigation/TabNavigator';
import { SplashScreenComponent } from './src/components/SplashScreen';

// White + Orange Premium Theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#F97316',       // Vibrant Orange
    secondary: '#EA580C',     // Deep Orange
    tertiary: '#FB923C',      // Light Orange
    background: '#FFFFFF',    // Clean White
    surface: '#FFF7ED',       // Warm Off-White
    text: '#1E293B',          // Dark Slate for text
  },
};

const MainAppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hydrate application state from AsyncStorage
    dispatch(fetchSettings());
    dispatch(fetchProducts());
    dispatch(fetchInvoices());
  }, [dispatch]);

  if (showSplash) {
    return <SplashScreenComponent onFinish={() => setShowSplash(false)} />;
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PaperProvider theme={theme}>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
          <MainAppContent />
        </PaperProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

registerRootComponent(App);
