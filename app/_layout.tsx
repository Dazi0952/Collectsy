// app/_layout.tsx - Z LOGIKĄ PRZEKIEROWANIA
import { Stack, useRouter, SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth'; // Importujemy nasz hook

// Zapobiega migotaniu ekranu powitalnego, gdy użytkownik jest już zalogowany
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

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

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
      <Stack.Screen name="register" options={{ title: 'Stwórz konto', presentation: 'modal' }} />
      <Stack.Screen name="login" options={{ title: 'Zaloguj się', presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
    </Stack>
  );
}