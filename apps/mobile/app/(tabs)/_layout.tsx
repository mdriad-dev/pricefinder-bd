import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'অনুসন্ধান',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'বারকোড',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📷</Text>,
        }}
      />
      <Tabs.Screen
        name="identify"
        options={{
          title: 'AI ছবি',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>✨</Text>,
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'দোকানসমূহ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📍</Text>,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'প্রোফাইল',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
