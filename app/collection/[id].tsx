// app/collection/[id].tsx - POPRAWIONA WERSJA
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useCallback } from 'react';
import { supabase } from '../../src/api/supabase';
import { Link, useFocusEffect, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';

type Item = { id: string; name: string; image_urls: string[]; };

export default function CollectionDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchCollectionItems = async () => {
        if (!id) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('items')
            .select('id, name, image_urls')
            .eq('collection_id', id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setItems(data || []);
        } catch (error) {
          console.error("Błąd pobierania przedmiotów z kolekcji:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCollectionItems();

    }, [id]) // Zależność od 'id' kolekcji
  );

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={[styles.centered, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: name || 'Kolekcja' }} />
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
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ta kolekcja jest pusta.</Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }} // Ważne, aby ListEmptyComponent był wyśrodkowany
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  itemContainer: { flex: 1, aspectRatio: 1, margin: 1 },
  itemImage: { width: '100%', height: '100%' },
  collectionIcon: { position: 'absolute', top: 8, right: 8, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  emptyText: { fontSize: FontSize.body },
});