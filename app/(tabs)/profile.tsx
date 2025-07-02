// app/(tabs)/profile.tsx - POPRAWIONA I KOMPLETNA WERSJA
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useCallback } from 'react';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { Colors } from 'react-native/Libraries/NewAppScreen';

type Item = {
  id: string;
  name: string;
  image_urls: string[];
};

type Profile = {
  username: string;
  avatar_url: string | null;
};

type CollectionWithCover = {
  id: string;
  name: string;
  cover_image_url: string | null;
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionWithCover[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Używamy useFocusEffect, aby odświeżać dane za każdym razem, gdy ekran jest widoczny
  const fetchUserData = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setCollections([]);
      return;
    }
    try {
      const [profileResponse, collectionsResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.rpc('get_collections_with_covers', { user_id_param: user.id })
      ]);

      if (profileResponse.error) throw profileResponse.error;
      setProfile(profileResponse.data);

      if (collectionsResponse.error) throw collectionsResponse.error;
      setCollections(collectionsResponse.data || []);

    } catch (error) {
      console.error("Błąd podczas pobierania danych użytkownika:", error);
    }
  }, [user]);

  // Hook do ładowania danych przy wejściu na ekran
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserData().finally(() => setLoading(false));
    }, [fetchUserData])
  );

  // Funkcja obsługująca "pull-to-refresh"
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, [fetchUserData]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={[styles.centered, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/png?seed=${profile?.username || user?.email}` }} 
          style={styles.avatar} 
        />
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{collections.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kolekcji</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.username, { color: colors.text }]}>{profile?.username || user?.email}</Text>
      
      <View style={styles.actionsContainer}>
        <Link href="/edit-profile" asChild>
          <Pressable style={[styles.button, { backgroundColor: colors.surface }]}>
            <Text style={[styles.buttonText, { color: colors.text }]}>Edytuj Profil</Text>
          </Pressable>
        </Link>
      </View>
      <View style={{ flex: 1}}>
      <FlatList
        data={collections}
        extraData={collections}
        keyExtractor={(item) => item.id}
        numColumns={2}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({ item: collection }) => (
  <Link href={`/collection/${collection.id}?name=${collection.name}`} asChild>
    <Pressable style={{ 
        flex: 1, 
        margin: 8, 
        aspectRatio: 1,
    }}>
      <Image 
        source={{ uri: collection.cover_image_url || 'https://via.placeholder.com/300' }}
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
      />
      <View style={{
          position: 'absolute', // Kluczowy element
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: 8,
          borderBottomLeftRadius: 12, // Dopasuj do zaokrąglenia obrazka
          borderBottomRightRadius: 12,
      }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {collection.name}
        </Text>
      </View>
    </Pressable>
  </Link>
)}
      />
      </View>
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
  actionsContainer: { paddingHorizontal: Spacing.medium, paddingBottom: Spacing.small },
  button: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  collectionContainer: {
  flex: 1,
  margin: Spacing.small,
  aspectRatio: 1, // Zapewnia kwadratowy kształt
  borderRadius: 12,
  overflow: 'hidden', // Ważne, aby zaokrąglić też obrazek
  backgroundColor: Colors.surface, // Użyj dynamicznego koloru
},
collectionImage: {
  width: '100%',
  height: '100%',
},
collectionOverlay: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // Półprzezroczyste czarne tło
  padding: Spacing.small,
},
collectionName: {
  color: 'white',
  fontSize: FontSize.subheadline,
  fontWeight: 'bold',
  textAlign: 'center',
},
});