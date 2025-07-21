
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useCallback } from 'react';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import UserProfile from '../../src/components/profile/UserProfile';

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
  const { user, loading } = useAuth();
   const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  
  if (!user) {
    return null;
  }

  
  return <UserProfile userId={user.id} />;
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