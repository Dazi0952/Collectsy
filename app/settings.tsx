
import { View, Text, StyleSheet, Button, Alert, Switch } from 'react-native';
import React from 'react';
import { supabase } from '../src/api/supabase';
import { useRouter, Stack } from 'expo-router';
import { Colors, Spacing, lightTheme, darkTheme, FontSize } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';


export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const isDarkMode = theme === 'dark';

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Błąd", "Nie udało się wylogować.");
    } else {
      
      router.replace('/'); 
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Stack.Screen options={{ 
          title: 'Ustawienia',
          
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text }
      }} />
      
      <View style={styles.section}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          {/* Dynamiczny kolor tekstu */}
          <Text style={[styles.rowLabel, { color: colors.text }]}>Tryb ciemny</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
      </View>
      <Button title="Wyloguj się" color={colors.danger} onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.medium,
    justifyContent: 'space-between' 
  },
  section: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.medium,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: FontSize.body,
  }
});