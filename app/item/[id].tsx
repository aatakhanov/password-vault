import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VaultItem } from '../../src/types';
import { offlineVault } from '../../src/storage/offlineVault';
import { generateTOTP } from '../../src/utils/totp';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<VaultItem | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [totpCode, setTotpCode] = useState<string>('------');
  const [totpSeconds, setTotpSeconds] = useState<number>(30);
  const router = useRouter();

  useEffect(() => {
    async function loadItem() {
      try {
        const items = await offlineVault.getAllItems();
        const found = items.find((i) => i.id === id);
        if (found) {
          setItem(found);
        } else {
          Alert.alert('Topilmadi', 'Yozuv topilmadi');
          router.back();
        }
      } catch (err: any) {
        Alert.alert('Xatolik', err.message);
      }
    }
    loadItem();
  }, [id]);

  // 2FA / TOTP Taymeri (Har soniyada yangilanadi)
  useEffect(() => {
    if (!item?.totpSecret) return;

    let isMounted = true;
    const updateCode = async () => {
      try {
        const res = await generateTOTP(item.totpSecret!);
        if (isMounted) {
          setTotpCode(res.code);
          setTotpSeconds(res.secondsRemaining);
        }
      } catch (e) {
        console.error('TOTP xatosi:', e);
      }
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [item?.totpSecret]);

  const copyToClipboard = (text?: string, label = 'Ma\'lumot') => {
    if (!text) return;
    Clipboard.setString(text);
    Alert.alert('Nusxalandi', `${label} nusxalandi! 30 soniyadan so'ng buferdan tozalang.`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Yozuvni o\'chirish',
      'Ushbu yozuv butunlay o\'chiriladi. Rozimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O\'chirish',
          style: 'destructive',
          onPress: async () => {
            if (item) {
              await offlineVault.deleteItem(item.id);
              Alert.alert('O\'chirildi', 'Yozuv o\'chirildi.');
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!item) return;
    router.push({
      pathname: '/item/create',
      params: { editId: item.id },
    } as any);
  };

  if (!item) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Sarlavha */}
      <View style={styles.headerCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.catBadge}>{item.category.toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.editHeaderBtn} onPress={handleEdit}>
          <Text style={styles.editHeaderBtnText}>✏️ Tahrirlash</Text>
        </TouchableOpacity>
      </View>

      {/* 2FA / TOTP Authenticator Vidjeti */}
      {item.totpSecret && (
        <View style={styles.totpCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.totpLabel}>🔢 2FA KODI (AUTHENTICATOR)</Text>
              <Text style={styles.totpCode}>
                {totpCode.slice(0, 3)} {totpCode.slice(3)}
              </Text>
            </View>
            <View style={styles.totpTimerCircle}>
              <Text style={styles.totpTimerText}>{totpSeconds}s</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.totpCopyBtn}
            onPress={() => copyToClipboard(totpCode, '2FA Kodi')}
          >
            <Text style={styles.totpCopyBtnText}>📋 2FA Kodini Nusxalash</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Login va Parol bo'limi */}
      {item.category === 'login' && (
        <View style={styles.section}>
          {item.username && (
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Login / Email</Text>
                <Text style={styles.fieldValue}>{item.username}</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(item.username, 'Login')}
              >
                <Text style={styles.copyBtnText}>Nusxa</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.password && (
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Parol</Text>
                <Text style={[styles.fieldValue, { fontFamily: 'monospace' }]}>
                  {showPassword ? item.password : '••••••••••••••••'}
                </Text>
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeBtnText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(item.password, 'Parol')}
                >
                  <Text style={styles.copyBtnText}>Nusxa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {item.url && (
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Veb-sayt</Text>
                <Text style={styles.fieldValue}>{item.url}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Bank kartasi bo'limi */}
      {item.category === 'card' && (
        <View style={styles.section}>
          {item.cardNumber && (
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Karta raqami</Text>
                <Text style={[styles.fieldValue, { fontFamily: 'monospace' }]}>
                  {item.cardNumber}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(item.cardNumber, 'Karta raqami')}
              >
                <Text style={styles.copyBtnText}>Nusxa</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.rowTwo}>
            {item.expiryDate && (
              <View style={[styles.fieldRow, { flex: 1 }]}>
                <View>
                  <Text style={styles.fieldLabel}>Muddati</Text>
                  <Text style={styles.fieldValue}>{item.expiryDate}</Text>
                </View>
              </View>
            )}
            {item.cvv && (
              <View style={[styles.fieldRow, { flex: 1 }]}>
                <View>
                  <Text style={styles.fieldLabel}>CVV</Text>
                  <Text style={styles.fieldValue}>•••</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(item.cvv, 'CVV')}
                >
                  <Text style={styles.copyBtnText}>Nusxa</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {item.cardHolder && (
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Karta egasi</Text>
                <Text style={styles.fieldValue}>{item.cardHolder}</Text>
              </View>
            </View>
          )}

          {item.pin && (
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>PIN-kod</Text>
                <Text style={styles.fieldValue}>{showPin ? item.pin : '••••'}</Text>
              </View>
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPin(!showPin)}>
                <Text style={styles.eyeBtnText}>{showPin ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Wi-Fi bo'limi */}
      {item.category === 'wifi' && (
        <View style={styles.section}>
          {item.wifiSsid && (
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Wi-Fi Nomi (SSID)</Text>
                <Text style={styles.fieldValue}>{item.wifiSsid}</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(item.wifiSsid, 'Wi-Fi Nomi')}
              >
                <Text style={styles.copyBtnText}>Nusxa</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.wifiPassword && (
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Wi-Fi Paroli</Text>
                <Text style={[styles.fieldValue, { fontFamily: 'monospace' }]}>
                  {showPassword ? item.wifiPassword : '••••••••••••••••'}
                </Text>
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeBtnText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(item.wifiPassword, 'Wi-Fi Paroli')}
                >
                  <Text style={styles.copyBtnText}>Nusxa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Hujjat bo'limi */}
      {item.category === 'id_doc' && (
        <View style={styles.section}>
          {item.docType && (
            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Hujjat Turi</Text>
                <Text style={styles.fieldValue}>{item.docType}</Text>
              </View>
            </View>
          )}
          {item.docNumber && (
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Hujjat Raqami</Text>
                <Text style={[styles.fieldValue, { fontFamily: 'monospace' }]}>{item.docNumber}</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(item.docNumber, 'Hujjat Raqami')}
              >
                <Text style={styles.copyBtnText}>Nusxa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Maxfiy eslatma */}
      {item.notes && (
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Maxfiy Izoh</Text>
          <Text style={[styles.fieldValue, { marginTop: 6, lineHeight: 22 }]}>{item.notes}</Text>
        </View>
      )}

      {/* Parol tarixi (Password History) */}
      {item.passwordHistory && item.passwordHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Eski Parollar Tarixi</Text>
          {item.passwordHistory.map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyPwd}>• {h.password}</Text>
              <Text style={styles.historyDate}>
                {new Date(h.changedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* O'chirish tugmasi */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>🗑️ Yozuvni O'chirish</Text>
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
  headerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  catBadge: {
    backgroundColor: '#1E293B',
    color: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  editHeaderBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editHeaderBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  totpCard: {
    backgroundColor: 'linear-gradient(135deg, #0369A1, #0C4A6E)',
    backgroundColor: '#075985',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 14,
  },
  totpLabel: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  totpCode: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 4,
    marginTop: 2,
  },
  totpTimerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  totpTimerText: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 14,
  },
  totpCopyBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  totpCopyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fieldValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  eyeBtn: {
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  eyeBtnText: {
    fontSize: 16,
  },
  copyBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  copyBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  historyPwd: {
    color: '#CBD5E1',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  historyDate: {
    color: '#64748B',
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: '#7F1D1D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 30,
  },
  deleteBtnText: {
    color: '#FECACA',
    fontSize: 16,
    fontWeight: '700',
  },
});
