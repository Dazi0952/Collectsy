// app/(tabs)/feed.tsx
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/api/supabase';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors , FontSize , Spacing, lightTheme, darkTheme } from '../../src/constants/theme'
import { useTheme } from '../../src/context/ThemeContext'


// Użyjemy tego samego typu 'Item' co na ekranie profilu
type Item = {
  id: string;
  name: string;
  image_urls: string[];
};

export default function FeedScreen() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicItems();
  }, []);

  const fetchPublicItems = async () => {
    setLoading(true);
    
    // Pobieramy WSZYSTKIE przedmioty od WSZYSTKICH użytkowników
    const { data, error } = await supabase
      .from('items')
      .select('id, name, image_urls') // Pobieramy tylko potrzebne dane do siatki
      .order('created_at', { ascending: false }); // Najnowsze na górze

    if (error) {
      console.error(error);
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const filteredItems = items.filter(item => 
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Szukaj przedmiotów..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <Link href={`/item/${item.id}`} asChild>
            <Pressable style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
              <Image source={{ uri: item.image_urls[0] }} style={styles.itemImage} />
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              {item.image_urls.length > 1 && (
                <Ionicons name="copy-outline" size={18} color="white" style={styles.collectionIcon} />
              )}
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>Brak przedmiotów do odkrycia.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 10, 
    margin: Spacing.medium, 
    paddingHorizontal: Spacing.small },
  searchIcon: { marginRight: Spacing.small },
  searchInput: { flex: 1, 
    height: 40, 
    fontSize: FontSize.body },
  itemContainer: { flex: 1, 
    margin: Spacing.small, 
    borderRadius: 12, 
    elevation: 2, shadowColor: "#000", 
    shadowOffset: { width: 0, 
    height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4 },
    itemImage: { width: '100%', 
    aspectRatio: 1, 
    borderTopLeftRadius: 12, 
    borderTopRightRadius: 12 },
  itemName: { fontWeight: '600', 
    padding: Spacing.small, 
    fontSize: FontSize.subheadline },
  collectionIcon: { position: 'absolute', 
    top: 8, 
    right: 8, 
   textShadowColor: 'rgba(0, 0, 0, 0.75)', 
   textShadowOffset: { width: 0, height: 1 }, 
   textShadowRadius: 3 },
  emptyText: { textAlign: 'center', 
    marginTop: 50, 
    fontSize: FontSize.body },
  centered: { flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' },
});