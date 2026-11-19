import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { offlineVault } from '../../src/storage/offlineVault';
import { calculatePasswordStrength } from '../../src/utils/strength';

export default function SetupScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hint, setHint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const strength = calculatePasswordStrength(password);

  const handleSetup = async () => {
    if (password.length < 8) {
      Alert.alert('Xatolik', "Master parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Xatolik', 'Kiritilgan parollar bir-biriga mos kelmadi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await offlineVault.setupMasterPassword(password);
      Alert.alert(
        'Muvaffaqiyatli!',
        'Master parol xavfsiz o\'rnatildi va ma\'lumotlar shifrlash kaliti yaratildi.',
        [{ text: 'Boshlash', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err: any) {
      Alert.alert('Xatolik', err.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🛡️ 100% OFFLINE VA XAVFSIZ</Text>
      </View>

      <Text style={styles.title}>Master Parol O'rnatish</Text>
      <Text style={styles.subtitle}>
        Bu parol barcha parollaringizni AES-256 bilan shifrlaydi. U faqat telefoningizda saqlanadi
        va serverga uzatilmaydi.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Master Parol</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Kamida 8 ta belgi"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
        />

        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBarBg}>
              <View
                style={[
                  styles.strengthBarFill,
                  {
                    width: `${Math.min(100, ((strength.score + 1) / 5) * 100)}%`,
                    backgroundColor: strength.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.strengthText, { color: strength.color }]}>
              {strength.label} ({strength.entropy} bit entropiya)
            </Text>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 16 }]}>Parolni Tasdiqlang</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Parolni qayta kiriting"
          placeholderTextColor="#64748B"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSetup}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Shifrlash kaliti yaratilmoqda...' : 'Omborni Faollashtirish'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Muhim Eslatma:</Text>
        <Text style={styles.warningText}>
          Master parolni eslab qoling! Tizimda server yoki tashqi baza mavjud bo'lmagani sababli,
          master parolni qayta tiklab beradigan tashqi xizmat yo'q.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#090D16',
    padding: 24,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  strengthContainer: {
    marginTop: 10,
  },
  strengthBarBg: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  warningBox: {
    marginTop: 24,
    backgroundColor: '#1E1B18',
    borderWidth: 1,
    borderColor: '#78350F',
    borderRadius: 12,
    padding: 16,
  },
  warningTitle: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  warningText: {
    color: '#D97706',
    fontSize: 12,
    lineHeight: 18,
  },
});
