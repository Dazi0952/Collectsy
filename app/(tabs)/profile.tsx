// app/(tabs)/profile.tsx - WERSJA Z WYŚWIETLANIEM KOLEKCJI
import { View, Text, Button, StyleSheet, FlatList, Image, ActivityIndicator, Alert, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Definicja typu dla naszych przedmiotów, przyda się dla TypeScript
type Item = {
  id: string;
  name: string;
  image_urls: string[];
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ta funkcja uruchomi się, gdy komponent się załaduje
    if (user) {
      fetchUserItems();
    } else
    setLoading(false);
  }, [user]); // Uruchom ponownie, gdy 'user' się zmieni

  const fetchUserItems = async () => {
    if (!user) return;
    setLoading(true);
    
    // Pobieramy przedmioty z bazy
    const { data, error } = await supabase
      .from('items')
      .select('id, name, image_urls') // Wybieramy tylko potrzebne kolumny
      .eq('user_id', user.id) // Gdzie user_id jest równe ID zalogowanego użytkownika
      .order('created_at', { ascending: false }); // Najnowsze na górze

    if (error) {
      Alert.alert("Błąd", "Nie udało się pobrać przedmiotów.");
      console.error(error);
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login'); 
  };

  // Jeśli dane się jeszcze ładują, pokaż wskaźnik
  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Button title="Wyloguj się" onPress={handleLogout} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={3} // Ustawiamy 3 kolumny dla siatki
        renderItem={({ item }) => (
  <Link href={`/item/${item.id}`} asChild>
    <Pressable style={styles.itemContainer}>
      <Image 
        source={{ uri: item.image_urls[0] }} 
        style={styles.itemImage} 
      />
      
      {/* == NOWA LOGIKA DLA IKONY == */}
      {item.image_urls.length > 1 && (
        <Ionicons
          name="copy-outline" // Nazwa ikony z zestawu Ionicons
          size={18} // Rozmiar ikony
          color="white" // Kolor ikony
          style={styles.collectionIcon} // Styl do pozycjonowania
        />
      )}

        </Pressable>
      </Link>
      )}
        ListHeaderComponent={
          <Text style={styles.header}>Moja Kolekcja ({items.length})</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Twoja kolekcja jest pusta. Dodaj swój pierwszy przedmiot!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', padding: 16 },
  itemContainer: {
    flex: 1,
    aspectRatio: 1, // Utrzymuje kwadratowy kształt
    margin: 2,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
  collectionIcon: {
    position: 'absolute', // Pozycjonowanie absolutne względem rodzica (itemContainer)
    top: 8, // 8 pikseli od góry
    right: 8, // 8 pikseli od prawej
    // Opcjonalnie: mały cień dla lepszej widoczności
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});