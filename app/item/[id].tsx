// app/item/[id].tsx - WERSJA Z PEŁNYMI SZCZEGÓŁAMI
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, Dimensions, Button, Alert, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/context/ThemeContext';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from 'react-native/Libraries/NewAppScreen';

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
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = async () => {
  setLoading(true);
  try {
    // Pobieramy dane przedmiotu i informacje o polubieniach równocześnie
    const [itemRes, likeRes] = await Promise.all([
      supabase.from('items').select('*, user_id').eq('id', id).single(),
      supabase.from('likes').select('*', { count: 'exact' }).eq('item_id', id)
    ]);
    
    if (itemRes.error) throw itemRes.error;
    setItem(itemRes.data);

    if (likeRes.error) throw likeRes.error;
    setLikeCount(likeRes.count || 0);

    // Sprawdź, czy zalogowany użytkownik już polubił ten przedmiot
    if (user) {
      const userLike = likeRes.data?.find(like => like.user_id === user.id);
      setIsLiked(!!userLike); // Ustawia na true jeśli znaleziono, false jeśli nie
    }
  } catch (error) {
    console.error("Błąd pobierania szczegółów przedmiotu:", error);
  } finally {
    setLoading(false);
  }
};

const toggleLike = async () => {
  if (!user) {
    Alert.alert("Błąd", "Musisz być zalogowany, aby polubić przedmiot.");
    return;
  }
  
  // Optymistyczna aktualizacja UI
  setIsLiked(!isLiked);
  setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

  if (isLiked) {
    // Jeśli już jest polubione -> usuń polubienie
    await supabase.from('likes').delete().match({ item_id: id, user_id: user.id });
  } else {
    // Jeśli nie jest polubione -> dodaj polubienie
    await supabase.from('likes').insert({ item_id: id, user_id: user.id });
  }
  // Można dodać obsługę błędu i przywrócenie stanu UI w razie niepowodzenia
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
    if (!item) return;
  // Nawiguj do ekranu edycji, przekazując ID jako parametr
  router.push(`/item/edit?id=${item.id}`);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  if (!item) return <View style={styles.centered}><Text>Nie znaleziono przedmiotu.</Text></View>;

  // Sprawdzamy, czy zalogowany użytkownik jest właścicielem przedmiotu
  const isOwner = user?.id === item.user_id;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ title: item.name }} />
    
    {/* Karuzela zdjęć - teraz jest samodzielna */}
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
      {item.image_urls.map((url, index) => (
        <Image key={index} source={{ uri: url }} style={styles.image} />
        
      ))}
    </ScrollView>
    <View style={styles.actionsContainer}>
  <Pressable onPress={toggleLike} style={styles.likeButton}>
    <Ionicons 
      name={isLiked ? "heart" : "heart-outline"} 
      size={28} 
      color={isLiked ? colors.danger : colors.text} 
    />
    <Text style={[styles.likeCount, { color: colors.text }]}>{likeCount}</Text>
  </Pressable>
  {/* Tu mogą być inne przyciski, np. "Skomentuj" */}
</View>

    <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
        {item.is_for_sale && item.price && (
          <Text style={[styles.price, { color: colors.primary }]}>{item.price.toFixed(2)} PLN</Text>
        )}
        <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
        
        <View style={[styles.metaContainer, { borderTopColor: colors.border }]}>
          {item.author && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Autor:</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{item.author}</Text>
            </View>
          )}
          {item.year && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Rok:</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{item.year}</Text>
            </View>
          )}
        </View>
      </View>

      {isOwner && (
        <View style={[styles.managementContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Button title="Edytuj" onPress={handleEdit} color={colors.primary} />
          <Button title="Usuń" onPress={handleDelete} color={colors.danger} />
        </View>
      )}
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
  contentContainer: {
    paddingBottom: 50, // Dodaje margines na dole, aby nic nie było ucięte
  },
  actionsContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: Spacing.small,
  borderBottomWidth: 1,
  borderBottomColor: Colors.border,
  marginBottom: Spacing.medium,
},
likeButton: {
  flexDirection: 'row',
  alignItems: 'center',
},
likeCount: {
  marginLeft: Spacing.small,
  fontSize: FontSize.body,
  fontWeight: '600',
},
});