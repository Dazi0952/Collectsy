
import { Stack, useRouter, SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { Colors, FontSize, Spacing, lightTheme, darkTheme, } from '../src/constants/theme';
import { StatusBar } from 'expo-status-bar';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  return (
    <ThemeProvider>
      {/* Tu w przyszłości dodamy komponent, który reaguje na zmianę motywu */}
      <RootLayoutNav />
    </ThemeProvider>
  )
}
function RootLayoutNav() {

  const { session, loading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    
    
    if (loading) {
      
      return;
    }

    if (session) {
      
      
      router.replace('/(tabs)/profile');
    } else {
      
      
      router.replace('/');
    }
    
    
    SplashScreen.hideAsync();

  }, [session, loading]); 

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <>
      {/* Ustawiamy kolor paska statusu na podstawie motywu */}
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            title: 'Ustawienia',
          }}
        />
        <Stack.Screen 
          name="edit-profile" 
          options={{ 
          title: "Edytuj Profil", 
          presentation: 'modal' 
           }}
        />
      </Stack>
    </>
  );
}