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
import { generatePassword, DEFAULT_GENERATOR_OPTIONS } from '../../src/utils/generator';
import { calculatePasswordStrength } from '../../src/utils/strength';
import { PasswordGeneratorOptions } from '../../src/types';

export default function GeneratorScreen() {
  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_GENERATOR_OPTIONS);
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleGenerate = (customOpts?: Partial<PasswordGeneratorOptions>) => {
    const updated = { ...options, ...customOpts };
    const newPwd = generatePassword(updated);
    setPassword(newPwd);
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const strength = calculatePasswordStrength(password);

  const handleCopy = () => {
    Clipboard.setString(password);
    Alert.alert('Nusxalandi!', 'Parol nusxalandi. Uni xavfsiz joyga qo\'ying.');
  };

  const handleSaveToVault = () => {
    router.push({
      pathname: '/item/create',
      params: { generatedPassword: password },
    } as any);
  };

  const updateOption = <K extends keyof PasswordGeneratorOptions>(
    key: K,
    val: PasswordGeneratorOptions[K]
  ) => {
    const newOpts = { ...options, [key]: val };
    setOptions(newOpts);
    handleGenerate(newOpts);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Parol ko'rsatish bloki */}
      <View style={styles.displayCard}>
        <Text style={styles.passwordText} selectable numberOfLines={2}>
          {password}
        </Text>

        {/* Strength Bar */}
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
          <View style={styles.strengthInfoRow}>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
            <Text style={styles.entropyText}>{strength.entropy} bit entropiya</Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleGenerate()}>
            <Text style={styles.actionBtnText}>🔄 Yangilash</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleCopy}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>📋 Nusxalash</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sozlamalar */}
      <View style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Parametrlar</Text>

        {/* Uzunlik */}
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Parol uzunligi</Text>
            <Text style={styles.settingDesc}>Tavsiya: 16 yoki undan ortiq</Text>
          </View>
          <View style={styles.lengthControls}>
            <TouchableOpacity
              style={styles.lenBtn}
              onPress={() => updateOption('length', Math.max(6, options.length - 2))}
            >
              <Text style={styles.lenBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.lengthValue}>{options.length}</Text>
            <TouchableOpacity
              style={styles.lenBtn}
              onPress={() => updateOption('length', Math.min(64, options.length + 2))}
            >
              <Text style={styles.lenBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Katta harflar */}
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Katta harflar (A-Z)</Text>
          <Switch
            value={options.includeUppercase}
            onValueChange={(val) => updateOption('includeUppercase', val)}
            trackColor={{ false: '#334155', true: '#2563EB' }}
          />
        </View>

        {/* Kichik harflar */}
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Kichik harflar (a-z)</Text>
          <Switch
            value={options.includeLowercase}
            onValueChange={(val) => updateOption('includeLowercase', val)}
            trackColor={{ false: '#334155', true: '#2563EB' }}
          />
        </View>

        {/* Raqamlar */}
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Raqamlar (0-9)</Text>
          <Switch
            value={options.includeNumbers}
            onValueChange={(val) => updateOption('includeNumbers', val)}
            trackColor={{ false: '#334155', true: '#2563EB' }}
          />
        </View>

        {/* Maxsus belgilar */}
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Maxsus belgilar (!@#$%^&*)</Text>
          <Switch
            value={options.includeSymbols}
            onValueChange={(val) => updateOption('includeSymbols', val)}
            trackColor={{ false: '#334155', true: '#2563EB' }}
          />
        </View>

        {/* O'xshash belgilarni chiqarib tashlash */}
        <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.settingTitle}>Noaniq belgilarni istisno qilish</Text>
            <Text style={styles.settingDesc}>Chalg'ituvchi 0, O, l, 1 belgilari olib tashlanadi</Text>
          </View>
          <Switch
            value={options.excludeAmbiguous}
            onValueChange={(val) => updateOption('excludeAmbiguous', val)}
            trackColor={{ false: '#334155', true: '#2563EB' }}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToVault}>
        <Text style={styles.saveBtnText}>➕ Omborga Yozuv Sifatida Saqlash</Text>
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
  displayCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  passwordText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 50,
  },
  strengthContainer: {
    marginBottom: 16,
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
  strengthInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  entropyText: {
    color: '#64748B',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnPrimary: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  actionBtnText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtnTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  settingsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  settingTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  settingDesc: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  lengthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lenBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  lenBtnText: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '700',
  },
  lengthValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
