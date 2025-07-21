
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useCallback } from 'react';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
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

type UserProfileProps = {
  userId: string;
};

export default function UserProfile({ userId }: UserProfileProps) {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionWithCover[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isMyProfile = currentUser?.id === userId;

  
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const currentUserId = currentUser?.id;
      
      const profilePromise = supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      const collectionsPromise = supabase.rpc('get_collections_with_covers', { user_id_param: userId });
      const followerPromise = supabase.rpc('get_follower_count', { profile_id: userId });
      const followingPromise = supabase.rpc('get_following_count', { profile_id: userId });

      
      const checkFollowPromise = currentUserId
        ? supabase.from('followers').select('*', { count: 'exact' }).match({ follower_id: currentUserId, following_id: userId })
        : Promise.resolve({ data: null, error: null, count: 0 }); 

      
      const [profileRes, collectionsRes, followerRes, followingRes, checkFollowRes] = await Promise.all([
        profilePromise,
        collectionsPromise,
        followerPromise,
        followingPromise,
        checkFollowPromise
      ]);

      if (profileRes.error) throw profileRes.error;
      setProfile(profileRes.data);

      if (collectionsRes.error) throw collectionsRes.error;
      setCollections(collectionsRes.data || []);

      if (followerRes.error) throw followerRes.error;
      setFollowerCount(followerRes.data || 0);

      if (followingRes.error) throw followingRes.error;
      setFollowingCount(followingRes.data || 0);

      if (checkFollowRes.error) throw checkFollowRes.error;
      setIsFollowing((checkFollowRes.count || 0) > 0);

    } catch (error) {
      console.error("Błąd podczas pobierania danych użytkownika:", error);
    }
  }, [userId, currentUser]);

  
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserData().finally(() => setLoading(false));
    }, [fetchUserData])
  );

  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, [fetchUserData]);

  const toggleFollow = async () => {
    if (!currentUser || isMyProfile) return;

    
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);

    if (isFollowing) {
      
      await supabase.from('followers').delete().match({
        follower_id: currentUser.id,
        following_id: userId,
      });
    } else {
      
      await supabase.from('followers').insert({
        follower_id: currentUser.id,
        following_id: userId,
      });
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={[styles.centered, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/png?seed=${profile?.username}` }} style={styles.avatar} />
        <View style={styles.statsContainer}>
          <View style={styles.stat}><Text style={[styles.statNumber, { color: colors.text }]}>{collections.length}</Text><Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kolekcji</Text></View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {followerCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Obserwujący
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.username, { color: colors.text }]}>{profile?.username}</Text>

      {isMyProfile ? (
        <View style={styles.actionsContainer}><Link href="/edit-profile" asChild><Pressable style={[styles.button, { backgroundColor: colors.surface }]}><Text style={[styles.buttonText, { color: colors.text }]}>Edytuj Profil</Text></Pressable></Link></View>
      ) : (
        <View style={styles.actionsContainer}>
          <Pressable
            onPress={toggleFollow}
            style={[
              styles.button,
              isFollowing ? { backgroundColor: colors.surface } : { backgroundColor: colors.primary }
            ]}
          >
            <Text style={[
              styles.buttonText,
              isFollowing ? { color: colors.text } : { color: 'white' }
            ]}>
              {isFollowing ? 'Obserwujesz' : 'Obserwuj'}
            </Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        numColumns={2}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({ item: collection }) => (
          <Link href={`/collection/${collection.id}?name=${collection.name}`} asChild>
            <Pressable style={styles.collectionContainer}><Image source={{ uri: collection.cover_image_url || 'https://via.placeholder.com/300' }} style={styles.collectionImage} /><View style={styles.collectionOverlay}><Text style={styles.collectionName}>{collection.name}</Text></View></Pressable>
          </Link>
        )}
        contentContainerStyle={{ paddingHorizontal: Spacing.small, flexGrow: 1 }}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Brak kolekcji.</Text></View>}
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
  actionsContainer: { paddingHorizontal: Spacing.medium, paddingBottom: Spacing.small },
  button: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  collectionContainer: {
    flex: 1,
    margin: Spacing.small,
    aspectRatio: 1, 
    borderRadius: 12,
    overflow: 'hidden', 
    backgroundColor: Colors.surface, 
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    padding: Spacing.small,
  },
  collectionName: {
    color: 'white',
    fontSize: FontSize.subheadline,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});