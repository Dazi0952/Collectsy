// app/_layout.tsx - Z LOGIKĄ PRZEKIEROWANIA
import { Stack, useRouter, SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { Colors, FontSize, Spacing, lightTheme, darkTheme, } from '../src/constants/theme';
import { StatusBar } from 'expo-status-bar';

// Zapobiega migotaniu ekranu powitalnego, gdy użytkownik jest już zalogowany
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
    // Ten efekt będzie się uruchamiał za każdym razem,
    // gdy zmieni się stan 'loading' lub 'session'.
    if (loading) {
      // Jeśli wciąż sprawdzamy, kto jest zalogowany, nic nie rób.
      return;
    }

    if (session) {
      // Jeśli jest aktywna sesja (użytkownik zalogowany),
      // przenieś go do sekcji chronionej.
      router.replace('/(tabs)/profile');
    } else {
      // Jeśli nie ma sesji (użytkownik wylogowany),
      // przenieś go do ekranu powitalnego.
      router.replace('/');
    }
    
    // Gdy przekierowanie zostanie wykonane, ukryj ekran powitalny
    SplashScreen.hideAsync();

  }, [session, loading]); // Zależności efektu

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
          name="settings" // Poprawiona ścieżka z poprzedniego kroku
          options={{
            presentation: 'modal',
            title: 'Ustawienia',
          }}
        />
        {/* Usunąłem stąd definicje 'login' i 'register', bo są one częścią głównego Stacka i nie potrzebują osobnej konfiguracji tutaj */}
      </Stack>
    </>
  );
}