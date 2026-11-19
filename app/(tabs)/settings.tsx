import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { offlineVault } from '../../src/storage/offlineVault';
import { AppSettings } from '../../src/types';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const router = useRouter();

  useEffect(() => {
    offlineVault.getSettings().then(setSettings);
  }, []);

  const handleUpdate = async (patch: Partial<AppSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...patch };
    setSettings(updated);
    await offlineVault.saveSettings(updated);
  };

  const handleLockNow = () => {
    offlineVault.lockVault();
    router.replace('/(auth)/unlock');
  };

  // Parollarni ochiq TXT fayl ko'rinishida nusxalash / eksport qilish
  const handleExportTxt = async () => {
    try {
      const txt = await offlineVault.exportToPlainText();
      Clipboard.setString(txt);
      Alert.alert(
        '📄 Barcha Parollar TXT Formatida Tayyor',
        'Barcha parollaringiz matn (.txt) formatida xotiraga nusxalandi! Uni xohlagan matn muharririga (Notepad, Notes) joylab .txt fayl sifatida saqlashingiz mumkin.\n\n⚠️ Diqqat: Ushbu fayl shifrlanmagan ochiq matn, uni xavfsiz saqlang!',
        [{ text: 'Tushunarli' }]
      );
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    }
  };

  const handleExportBackup = async () => {
    try {
      const backup = await offlineVault.exportEncryptedBackup();
      Alert.alert(
        'Shifrlangan Zaxira Nusxasi (Backup)',
        `Zaxira fayli yaratildi (${backup.appName} v${backup.version}). U faqat sizning Master parolingiz orqali ochiladi.`,
        [{ text: 'Tushunarli' }]
      );
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    }
  };

  const handleWipeData = () => {
    Alert.alert(
      'DIQQAT: Barcha ma\'lumotlar o\'chiriladi!',
      'Telefon xotirasidagi barcha parollar, kartalar va master parol butunlay yo\'q qilinadi. Bu amalni ortga qaytarib bo\'lmaydi.',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, hammasini o\'chirish',
          style: 'destructive',
          onPress: async () => {
            await offlineVault.wipeAllData();
            Alert.alert('Tozalandi', 'Barcha ma\'lumotlar muvaffaqiyatli o\'chirildi.');
            router.replace('/(auth)/setup');
          },
        },
      ]
    );
  };

  if (!settings) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 100% Offline Badge */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.privacyTitle}>100% Mahalliy (Offline) Xotira</Text>
          <Text style={styles.privacyDesc}>
            Ushbu ilova hech qachon internetga ulanmaydi va serverga ma'lumot uzatmaydi.
            Barcha parollar faqat shu telefoningizda AES-256 bilan shifrlangan holda yotadi.
          </Text>
        </View>
      </View>

      {/* TXT Faylga Eksport */}
      <View style={[styles.section, { borderColor: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.08)' }]}>
        <Text style={[styles.sectionHeader, { color: '#10B981' }]}>📄 TXT Fayl Eksporti</Text>
        <Text style={{ color: '#A7F3D0', fontSize: 13, marginBottom: 12, lineHeight: 18 }}>
          Barcha parollaringizni tushunarli matn (.txt) formatida xotiraga nusxalab, fayl sifatida saqlash imkoniyati.
        </Text>
        <TouchableOpacity style={styles.txtBtn} onPress={handleExportTxt}>
          <Text style={styles.txtBtnText}>📥 Barcha Parollarni TXT Formatida Olish</Text>
        </TouchableOpacity>
      </View>

      {/* Xavfsizlik sozlamalari */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Xavfsizlik</Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Skrinshotlarni bloklash</Text>
            <Text style={styles.rowDesc}>Ekranni rasmga olishdan himoyalash</Text>
          </View>
          <Switch
            value={settings.preventScreenshots}
            onValueChange={(val) => handleUpdate({ preventScreenshots: val })}
            trackColor={{ false: '#334155', true: '#2563EB' }}
          />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Buferni avtomatik tozalash</Text>
            <Text style={styles.rowDesc}>Nusxalangan parolni 30 soniyada o'chirish</Text>
          </View>
          <Text style={styles.badgeVal}>{settings.autoClearClipboardSeconds} soniya</Text>
        </View>

        <TouchableOpacity style={styles.actionRow} onPress={handleLockNow}>
          <Text style={styles.actionRowText}>🔐 Omborni Hoziroq Qulflash</Text>
        </TouchableOpacity>
      </View>

      {/* Zaxiralash */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Zaxira Nusxasi (Backup)</Text>
        <TouchableOpacity style={styles.actionRow} onPress={handleExportBackup}>
          <Text style={styles.actionRowText}>📦 Shifrlangan Zaxira Faylini Eksport Qilish (.json)</Text>
        </TouchableOpacity>
      </View>

      {/* Xavfli hudud */}
      <View style={[styles.section, { borderColor: '#7F1D1D' }]}>
        <Text style={[styles.sectionHeader, { color: '#EF4444' }]}>Xavfli Hudud</Text>
        <TouchableOpacity style={styles.dangerRow} onPress={handleWipeData}>
          <Text style={styles.dangerRowText}>🗑️ Barcha Ma'lumotlarni To'liq O'chirish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#090D16',
    flexGrow: 1,
  },
  privacyCard: {
    backgroundColor: '#064E3B',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#059669',
    marginBottom: 16,
  },
  privacyIcon: {
    fontSize: 28,
  },
  privacyTitle: {
    color: '#ECFDF5',
    fontSize: 15,
    fontWeight: '700',
  },
  privacyDesc: {
    color: '#A7F3D0',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  txtBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  txtBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  rowTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  rowDesc: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  badgeVal: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    paddingVertical: 12,
  },
  actionRowText: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerRow: {
    paddingVertical: 10,
  },
  dangerRowText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
