
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, Dimensions, Button, Alert, Pressable, TextInput } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, Stack, useRouter, Link } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/context/ThemeContext';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from 'react-native/Libraries/NewAppScreen';


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
  profiles: {
    username: string;
  } | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profiles: { 
    username: string;
    avatar_url: string | null;
  } [] | null;
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth(); 
  const router = useRouter();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  const fetchItemDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [itemRes, likeRes, commentRes] = await Promise.all([
        supabase.from('items').select('*, profiles(username)').eq('id', id).single(),
        supabase.from('likes').select('*', { count: 'exact' }).eq('item_id', id),
        supabase.from('comments').select(`*, profiles(username, avatar_url)`).eq('item_id', id).order('created_at', { ascending: false })
      ]);
      
      if (itemRes.error) throw itemRes.error;
      setItem(itemRes.data);

      if (likeRes.error) throw likeRes.error;
      setLikeCount(likeRes.count || 0);
      if (user) {
        const userLike = likeRes.data?.find(like => like.user_id === user.id);
        setIsLiked(!!userLike);
      }

      if (commentRes.error) throw commentRes.error;
      setComments(commentRes.data || []);
    } catch (error) {
      console.error("Błąd pobierania szczegółów przedmiotu:", error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]);

const handleAddComment = async () => {
  if (!user || newComment.trim() === '') return;
  
  const contentToPost = newComment.trim();
  setNewComment(''); 
  

  const { data, error } = await supabase
    .from('comments')
    .insert({
      item_id: id,
      user_id: user.id,
      content: contentToPost,
    })
    .select(`
    id,
    content,
    created_at,
    profiles ( username, avatar_url )
  `)
    .single();
    console.log("Odpowiedź z INSERT:", JSON.stringify(data, null, 2));
    
  if (error) {
  console.error("Błąd podczas dodawania komentarza:", error); 
  Alert.alert("Błąd", `Nie udało się dodać komentarza: ${error.message}`); 
  setNewComment(contentToPost);
  } else if (data) {
  
  const newCommentData: Comment = {
    ...data,
    profiles: Array.isArray(data.profiles) ? data.profiles : [data.profiles]
  };
  
  
  setComments(prevComments => [newCommentData, ...prevComments]);
  }
};

const toggleLike = async () => {
  if (!user) {
    Alert.alert("Błąd", "Musisz być zalogowany, aby polubić przedmiot.");
    return;
  }
  
  
  setIsLiked(!isLiked);
  setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

  if (isLiked) {
    
    await supabase.from('likes').delete().match({ item_id: id, user_id: user.id });
  } else {
    
    await supabase.from('likes').insert({ item_id: id, user_id: user.id });
  }
  
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
              router.back(); 
            }
          }
        }
      ]
    );
  };

  
  const handleEdit = () => {
    if (!item) return;
  
  router.push(`/item/edit?id=${item.id}`);
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={[styles.centered, {backgroundColor: colors.background}]} />;
  if (!item) return <View style={styles.centered}><Text style={{color: colors.text}}>Nie znaleziono przedmiotu.</Text></View>;

  
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
  <View style={styles.commentsSection}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>Komentarze ({comments.length})</Text>
  
  {/* Formularz dodawania nowego komentarza */}
  <View style={styles.addCommentContainer}>
    <TextInput
      style={[styles.commentInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
      placeholder="Dodaj komentarz..."
      placeholderTextColor={colors.textSecondary}
      value={newComment}
      onChangeText={setNewComment}
    />
    <Pressable onPress={handleAddComment} style={[styles.sendButton, { backgroundColor: colors.primary }]}>
      <Ionicons name="send" size={20} color="white" />
    </Pressable>
  </View>
  
  {/* Lista istniejących komentarzy */}
  {comments.map(comment => {
    const authorProfile = (comment.profiles && comment.profiles.length > 0) 
    ? comment.profiles[0] 
    : null;
  const avatarSeed = authorProfile?.username || 'anon';

  return (
    <View key={comment.id} style={styles.commentContainer}>
      <Image 
        source={{ uri: authorProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/png?seed=${avatarSeed}` }}
        style={styles.commentAvatar} 
      />
      <View style={[styles.commentBubble, { backgroundColor: colors.surface }]}>
        <Text style={[styles.commentUsername, { color: colors.text }]}>
          {authorProfile?.username || 'Użytkownik usunięty'}
        </Text>
        <Text style={[styles.commentContent, { color: colors.text }]}>
          {comment.content}
        </Text>
      </View>
    </View>
  );
})}
</View>
</View>

    <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
        {item.is_for_sale && item.price && (
          <Text style={[styles.price, { color: colors.primary }]}>{item.price.toFixed(2)} PLN</Text>
        )}
        <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
        
        <View style={[styles.metaContainer, { borderTopColor: colors.border }]}>
          {item.profiles?.username && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Autor:</Text>
              <Link href={`/profile/${item.user_id}`} asChild>
                <Pressable>
                  <Text style={[styles.metaValue, { color: colors.primary, textDecorationLine: 'underline' }]}>{item.profiles.username}</Text>
                </Pressable>
              </Link>
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
    color: '#28a745', 
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
    width: 80, 
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
    paddingBottom: 50, 
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
commentsSection: { paddingHorizontal: Spacing.medium },
sectionTitle: { fontSize: FontSize.headline, fontWeight: 'bold', marginBottom: Spacing.medium },
addCommentContainer: { flexDirection: 'row', marginBottom: Spacing.large },
commentInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: Spacing.small },
sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
commentContainer: { flexDirection: 'row', marginBottom: Spacing.medium },
commentAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: Spacing.small },
commentBubble: { flex: 1, backgroundColor: Colors.surface, borderRadius: 15, padding: Spacing.medium },
commentUsername: { fontWeight: 'bold', marginBottom: 4 },
commentContent: { lineHeight: 20 },
});