// app/(tabs)/profile.tsx - POPRAWIONA I KOMPLETNA WERSJA
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useCallback } from 'react';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

type Item = {
  id: string;
  name: string;
  image_urls: string[];
};

type Profile = {
  username: string;
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Używamy useFocusEffect, aby odświeżać dane za każdym razem, gdy ekran jest widoczny
  useFocusEffect(
  useCallback(() => {
    const fetchUserData = async () => {
      if (!user) {
        setItems([]);
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);

      // --- NOWA, BEZPIECZNIEJSZA LOGIKA ---

      // 1. Pobierz profil. Używamy .maybeSingle() zamiast .single()
      // .maybeSingle() zwraca 'null' zamiast błędu, jeśli nie znajdzie wiersza.
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle(); // <--- KLUCZOWA ZMIANA

      if (profileError) {
        console.error("Błąd pobierania profilu:", profileError);
      } else {
        setProfile(profileData);
      }

      // 2. Pobierz przedmioty. To zapytanie pozostaje bez zmian.
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('id, name, image_urls')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error("Błąd pobierania przedmiotów:", itemsError);
      } else {
        setItems(itemsData || []);
      }

      // 3. Zawsze zakończ ładowanie
      setLoading(false);
    };

    fetchUserData();
  }, [user])
);

  if (loading && !profile) { // Pokaż wskaźnik ładowania tylko przy pierwszym ładowaniu
    return <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileHeader}>
        <Image 
          // Generujemy awatar na podstawie nazwy użytkownika (jeśli jest) lub emaila
          source={{ uri: `https://api.dicebear.com/7.x/initials/png?seed=${profile?.username || user?.email}` }} 
          style={styles.avatar} 
        />
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{items.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Przedmiotów</Text>
          </View>
        </View>
      </View>
      
      {/* Wyświetlamy nazwę użytkownika, a jeśli jej nie ma - email */}
      <Text style={[styles.username, { color: colors.text }]}>
        {profile?.username || user?.email}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <Link href={`/item/${item.id}`} asChild>
            <Pressable style={styles.itemContainer}>
              <Image source={{ uri: item.image_urls[0] }} style={styles.itemImage} />
              {item.image_urls.length > 1 && (
                <Ionicons name="copy-outline" size={18} color="white" style={styles.collectionIcon} />
              )}
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Twoja kolekcja jest pusta.</Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Dodaj swój pierwszy przedmiot!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.medium,
    paddingTop: Spacing.medium,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' },
  statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  stat: { alignItems: 'center', marginHorizontal: Spacing.medium },
  statNumber: { fontSize: FontSize.headline, fontWeight: 'bold' },
  statLabel: { fontSize: FontSize.subheadline },
  username: {
    fontSize: FontSize.body,
    fontWeight: '600',
    paddingHorizontal: Spacing.medium,
    paddingTop: Spacing.small,
    paddingBottom: Spacing.medium,
  },
  itemContainer: { flex: 1, aspectRatio: 1, margin: 1 },
  itemImage: { width: '100%', height: '100%' },
  collectionIcon: { position: 'absolute', top: 8, right: 8, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: { fontSize: FontSize.headline, fontWeight: 'bold' },
  emptySubText: { fontSize: FontSize.body, marginTop: Spacing.small },
});