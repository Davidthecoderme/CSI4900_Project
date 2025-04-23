// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'login in' }} />
      <Stack.Screen name="homePage" options={{ title: 'Welcome' }} />
      <Stack.Screen name="chatBot" options={{ title: 'Welcome' }} />
      <Stack.Screen name="detectSkin" options={{ title: 'Welcome' }} />
      <Stack.Screen name="signup" options={{ title: 'Signing up' }} />
      <Stack.Screen name="userInfo" options={{ title: 'Information' }} />
      <Stack.Screen name="blog" options={{ title: 'Blog' }} />
      

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
