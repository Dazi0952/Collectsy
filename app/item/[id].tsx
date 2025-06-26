// app/item/[id].tsx - WERSJA Z PEŁNYMI SZCZEGÓŁAMI
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, Dimensions, Button, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';

// Definicja pełnego typu przedmiotu (bez zmian)
type ItemDetails = {
  id: string;
  name: string;
  description: string;
  year: number;
  author: string;
  price: number;
  is_for_sale: boolean;
  image_urls: string[];
  user_id: string;
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth(); // Pobieramy zalogowanego użytkownika
  const router = useRouter();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*, user_id') // Pobieramy wszystkie kolumny, co już robiliśmy
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setItem(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (!item) {
    return <View style={styles.centered}><Text>Nie znaleziono przedmiotu.</Text></View>;
  }
  const handleDelete = async () => {
    if (!item) return;

    Alert.alert(
      "Potwierdź usunięcie",
      `Czy na pewno chcesz usunąć "${item.name}"? Tej operacji nie można cofnąć.`,
      [
        { text: "Anuluj", style: "cancel" },
        { 
          text: "Usuń", 
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.from('items').delete().eq('id', item.id);
            if (error) {
              Alert.alert("Błąd", "Nie udało się usunąć przedmiotu.");
            } else {
              Alert.alert("Sukces", "Przedmiot został usunięty.");
              router.back(); // Wróć do poprzedniego ekranu
            }
          }
        }
      ]
    );
  };

  // === LOGIKA EDYCJI (na razie pusta) ===
  const handleEdit = () => {
    // W przyszłości: nawiguj do ekranu edycji, przekazując ID przedmiotu
    Alert.alert("Do zrobienia", "Ekran edycji nie jest jeszcze zaimplementowany.");
  };

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (!item) return <View style={styles.centered}><Text>Nie znaleziono przedmiotu.</Text></View>;

  // Sprawdzamy, czy zalogowany użytkownik jest właścicielem przedmiotu
  const isOwner = user?.id === item.user_id;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: item.name }} />
      
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
        {item.image_urls.map((url, index) => (
          <Image key={index} source={{ uri: url }} style={styles.image} />
        ))}
        {isOwner && (
        <View style={styles.managementContainer}>
          <Button title="Edytuj" onPress={handleEdit} />
          <Button title="Usuń" onPress={handleDelete} color="red" />
        </View>
      )}
      </ScrollView>

      {/* === NOWA, ROZBUDOWANA SEKCJA ZE SZCZEGÓŁAMI === */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{item.name}</Text>
        
        {/* Wyświetlanie ceny, jeśli przedmiot jest na sprzedaż */}
        {item.is_for_sale && item.price && (
          <Text style={styles.price}>{item.price.toFixed(2)} PLN</Text>
        )}

        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.metaContainer}>
          {item.author && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Autor:</Text>
              <Text style={styles.metaValue}>{item.author}</Text>
            </View>
          )}
          {item.year && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Rok:</Text>
              <Text style={styles.metaValue}>{item.year}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

// === ZAKTUALIZOWANE STYLE ===
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: 'white' },
  imageCarousel: { height: width },
  image: {
    width: width,
    height: width,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#28a745', // Zielony kolor ceny
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  metaContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 16,
    color: 'gray',
    width: 80, // Ustawiona szerokość dla wyrównania
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  managementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
});