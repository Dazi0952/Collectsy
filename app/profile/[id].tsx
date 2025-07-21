import React from "react";
import { Text, View } from "react-native";
import UserProfile from "../../src/components/profile/UserProfile";
import { useLocalSearchParams, Stack } from "expo-router";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return (
      <View>
        <Text>Nie znaleziono profilu. Brak ID.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Profil użytkownika" }} />
      <UserProfile userId={id} />
    </>
  );
}
