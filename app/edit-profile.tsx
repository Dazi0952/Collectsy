// app/edit-profile.tsx
import { View, Text, StyleSheet, TextInput, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/api/supabase';
import { useAuth } from '../src/hooks/useAuth';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../src/context/ThemeContext';
import { lightTheme, darkTheme, Spacing, FontSize } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const { user, session } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
    if (data) {
      setUsername(data.username);
      setAvatarUrl(data.avatar_url);
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setNewAvatar(result.assets[0]);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let publicAvatarUrl = avatarUrl; // Start with the existing URL

      // 1. If a new avatar was selected, upload it
      if (newAvatar) {
        const fileExt = newAvatar.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const arraybuffer = await fetch(newAvatar.uri).then(res => res.arrayBuffer());

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, arraybuffer, {
          contentType: newAvatar.mimeType ?? `image/${fileExt}`,
          upsert: true,
        });

        if (uploadError) throw uploadError;
        
        // Get public URL of the newly uploaded file
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        publicAvatarUrl = data.publicUrl;
      }

      // 2. Update the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username, avatar_url: publicAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert("Sukces", "Profil został zaktualizowany.");
      router.back();

    } catch (error: any) {
      Alert.alert("Błąd", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }}/>;

  const displayAvatar = newAvatar?.uri || avatarUrl || `https://api.dicebear.com/7.x/initials/png?seed=${user?.email}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Edytuj Profil', headerStyle: { backgroundColor: colors.background }, headerTitleStyle: { color: colors.text } }}/>
      
      <View style={styles.avatarContainer}>
        <Image source={{ uri: displayAvatar }} style={styles.avatar} />
        <Pressable style={[styles.avatarButton, { backgroundColor: colors.primary }]} onPress={pickImage}>
            <Ionicons name="camera-outline" size={24} color="white" />
        </Pressable>
      </View>
      
      <Text style={[styles.label, { color: colors.text }]}>Nazwa użytkownika</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        value={username}
        onChangeText={setUsername}
      />

      <Pressable style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleUpdateProfile} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Zapisywanie...' : 'Zapisz zmiany'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.medium },
  avatarContainer: { alignItems: 'center', marginVertical: Spacing.large },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee' },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    padding: Spacing.small,
    borderRadius: 20,
  },
  label: { fontSize: FontSize.body, fontWeight: '600', marginBottom: Spacing.small },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: Spacing.medium, paddingVertical: 12, marginBottom: Spacing.medium, fontSize: FontSize.body },
  saveButton: { padding: Spacing.medium, borderRadius: 8, alignItems: 'center', marginTop: Spacing.large },
  saveButtonText: { color: 'white', fontSize: FontSize.body, fontWeight: 'bold' },
});