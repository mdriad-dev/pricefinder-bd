import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#064E3B" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#064E3B',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#F9FAFB',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="compare/[variantId]"
          options={{
            title: 'মূল্য তুলনা (Price Comparison)',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="shopkeeper/manage"
          options={{
            title: 'দোকানদার ড্যাশবোর্ড (Shopkeeper)',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
