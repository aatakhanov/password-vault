import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VaultCategory, VaultItem } from '../../src/types';
import { offlineVault } from '../../src/storage/offlineVault';
import { calculatePasswordStrength } from '../../src/utils/strength';

export default function CreateItemScreen() {
  const params = useLocalSearchParams<{ generatedPassword?: string; editId?: string }>();
  const [category, setCategory] = useState<VaultCategory>('login');
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(params.generatedPassword || '');
  const [url, setUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [notes, setNotes] = useState('');
  
  // Bank kartasi
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [pin, setPin] = useState('');

  // Wi-Fi
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');

  // Hujjatlar
  const [docType, setDocType] = useState<'Pasport' | 'ID Karta' | 'Haydovchilik guvohnomasi' | 'Boshqa'>('Pasport');
  const [docNumber, setDocNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (params.editId) {
      offlineVault.getAllItems().then((items) => {
        const found = items.find((i) => i.id === params.editId);
        if (found) {
          setCategory(found.category);
          setTitle(found.title);
          setUsername(found.username || '');
          setPassword(found.password || '');
          setUrl(found.url || '');
          setTotpSecret(found.totpSecret || '');
          setNotes(found.notes || '');
          setCardNumber(found.cardNumber || '');
          setCardHolder(found.cardHolder || '');
          setExpiryDate(found.expiryDate || '');
          setCvv(found.cvv || '');
          setPin(found.pin || '');
          setWifiSsid(found.wifiSsid || '');
          setWifiPassword(found.wifiPassword || '');
          if (found.docType) setDocType(found.docType);
          setDocNumber(found.docNumber || '');
        }
      });
    }
  }, [params.editId]);

  const strength = calculatePasswordStrength(password);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Xatolik', 'Iltimos, yozuv nomini kiriting.');
      return;
    }

    try {
      setIsSubmitting(true);
      await offlineVault.saveItem({
        id: params.editId,
        category,
        title: title.trim(),
        username: username.trim() || undefined,
        password: password || undefined,
        url: url.trim() || undefined,
        totpSecret: totpSecret.trim() || undefined,
        notes: notes.trim() || undefined,
        cardNumber: cardNumber.trim() || undefined,
        cardHolder: cardHolder.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
        cvv: cvv.trim() || undefined,
        pin: pin.trim() || undefined,
        wifiSsid: wifiSsid.trim() || undefined,
        wifiPassword: wifiPassword.trim() || undefined,
        docType: category === 'id_doc' ? docType : undefined,
        docNumber: docNumber.trim() || undefined,
        isFavorite: false,
      });

      Alert.alert('Saqlandi', 'Ma\'lumot telefon xotirasiga shifrlangan holda saqlandi.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Kategoriya tanlash */}
      <View style={styles.catTabs}>
        {[
          { id: 'login' as VaultCategory, label: 'Sayt', icon: '🌐' },
          { id: 'card' as VaultCategory, label: 'Karta', icon: '💳' },
          { id: 'wifi' as VaultCategory, label: 'Wi-Fi', icon: '📶' },
          { id: 'id_doc' as VaultCategory, label: 'Hujjat', icon: '🪪' },
          { id: 'note' as VaultCategory, label: 'Eslatma', icon: '📝' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.catTab, category === tab.id && styles.catTabActive]}
            onPress={() => setCategory(tab.id)}
          >
            <Text style={styles.catTabIcon}>{tab.icon}</Text>
            <Text style={[styles.catTabLabel, category === tab.id && styles.catTabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sarlavha / Nomi */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nomi * (Masalan: Google, Telegram, Binance)</Text>
        <TextInput
          style={styles.input}
          placeholder="Yozuv nomini kiriting"
          placeholderTextColor="#64748B"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Login formasi */}
      {category === 'login' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Login / Email</Text>
            <TextInput
              style={styles.input}
              placeholder="user@gmail.com"
              placeholderTextColor="#64748B"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parol</Text>
            <TextInput
              style={styles.input}
              placeholder="Maxfiy parol"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
            />
            {password.length > 0 && (
              <View style={styles.strengthBox}>
                <Text style={[styles.strengthTxt, { color: strength.color }]}>
                  Xavfsizlik: {strength.label} ({strength.entropy} bit)
                </Text>
              </View>
            )}
          </View>

          {/* 2FA / TOTP MAXFIY KALITI */}
          <View style={[styles.inputGroup, styles.totpGroup]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.label, { color: '#38BDF8' }]}>🔢 2FA Maxfiy Kaliti (TOTP Secret)</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8' }}>Ixtiyoriy</Text>
            </View>
            <TextInput
              style={[styles.input, { borderColor: '#0284C7' }]}
              placeholder="Masalan: JBSWY3DPEHPK3PXP yoki otpauth://"
              placeholderTextColor="#64748B"
              value={totpSecret}
              onChangeText={setTotpSecret}
              autoCapitalize="characters"
            />
            <Text style={styles.helperText}>
              Google Authenticator o'rniga shu yerga 2FA kalitini qo'ysangiz, ilova o'zi 30s kodlarni hisoblab beradi.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Veb-sayt URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#64748B"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
            />
          </View>
        </>
      )}

      {/* Bank kartasi */}
      {category === 'card' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Karta raqami</Text>
            <TextInput
              style={styles.input}
              placeholder="8600 0000 0000 0000"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
          </View>
          <View style={styles.rowTwo}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Muddati</Text>
              <TextInput
                style={styles.input}
                placeholder="12/28"
                placeholderTextColor="#64748B"
                value={expiryDate}
                onChangeText={setExpiryDate}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Karta egasining ismi</Text>
            <TextInput
              style={styles.input}
              placeholder="ISM FAMILIYA"
              placeholderTextColor="#64748B"
              value={cardHolder}
              onChangeText={setCardHolder}
            />
          </View>
        </>
      )}

      {/* Wi-Fi */}
      {category === 'wifi' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wi-Fi Nomi (SSID)</Text>
            <TextInput
              style={styles.input}
              placeholder="Uy_Wi-Fi_5G"
              placeholderTextColor="#64748B"
              value={wifiSsid}
              onChangeText={setWifiSsid}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wi-Fi Paroli</Text>
            <TextInput
              style={styles.input}
              placeholder="Parol"
              placeholderTextColor="#64748B"
              value={wifiPassword}
              onChangeText={setWifiPassword}
            />
          </View>
        </>
      )}

      {/* Hujjat */}
      {category === 'id_doc' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hujjat Seriya va Raqami</Text>
            <TextInput
              style={styles.input}
              placeholder="AA 1234567"
              placeholderTextColor="#64748B"
              value={docNumber}
              onChangeText={setDocNumber}
            />
          </View>
        </>
      )}

      {/* Maxfiy izoh */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Maxfiy Izoh / Eslatma</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Qo'shimcha eslatmalar..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={isSubmitting}
      >
        <Text style={styles.saveBtnText}>
          {isSubmitting ? 'Shifrlanmoqda...' : '💾 Shifrlab Saqlash (AES-256)'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#090D16',
    flexGrow: 1,
  },
  catTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  catTab: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  catTabActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  catTabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  catTabLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  catTabLabelActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  totpGroup: {
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.3)',
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  helperText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  strengthBox: {
    marginTop: 6,
  },
  strengthTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
