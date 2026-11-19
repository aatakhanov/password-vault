import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { offlineVault } from '../src/storage/offlineVault';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function checkState() {
      try {
        const configured = await offlineVault.isConfigured();
        setIsConfigured(configured);
      } catch (err) {
        console.error('Holatni tekshirishda xatolik:', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkState();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isUnlocked = offlineVault.isUnlocked();

    if (!isConfigured) {
      if (segments[1] !== 'setup') {
        router.replace('/(auth)/setup');
      }
    } else if (!isUnlocked) {
      if (segments[1] !== 'unlock') {
        router.replace('/(auth)/unlock');
      }
    } else if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isConfigured, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Xavfsiz xotira yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#090D16' },
        }}
      >
        <Stack.Screen name="(auth)/setup" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/unlock" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="item/create"
          options={{ title: 'Yangi yozuv qo\'shish', presentation: 'modal' }}
        />
        <Stack.Screen
          name="item/[id]"
          options={{ title: 'Tafsilotlar', presentation: 'card' }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 15,
  },
});
