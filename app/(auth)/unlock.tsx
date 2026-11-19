import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { offlineVault } from '../../src/storage/offlineVault';

export default function UnlockScreen() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleUnlock = async () => {
    if (!password) {
      Alert.alert('Xatolik', 'Master parolni kiriting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await offlineVault.unlockWithPassword(password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Xatolik', 'Noto\'g\'ri master parol! Qayta urinib ko\'ring.');
      }
    } catch (err: any) {
      Alert.alert('Xatolik', err.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.lockEmoji}>🔒</Text>
      </View>

      <Text style={styles.title}>SecurePass Qulflangan</Text>
      <Text style={styles.subtitle}>
        Omborni ochish va shifrlangan ma'lumotlarni o'qish uchun Master parolni kiriting
      </Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Master parol"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleUnlock}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Tekshirilmoqda...' : 'Qulfdan Chiqarish'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.offlineNotice}>
        <Text style={styles.offlineText}>🟢 100% Offline (Hech qanday serverga ulanmaydi)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    maxWidth: 300,
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  offlineNotice: {
    marginTop: 30,
  },
  offlineText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
});
