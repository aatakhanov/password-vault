export type VaultCategory = 'login' | 'card' | 'note' | 'wifi' | 'id_doc';

export interface PasswordHistoryEntry {
  password: string;
  changedAt: number;
}

export interface VaultItem {
  id: string;
  category: VaultCategory;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;

  // 2FA / TOTP Authenticator maxfiy kaliti
  totpSecret?: string;
  
  // Bank kartalari
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  pin?: string;

  // Wi-Fi tarmoqlari
  wifiSsid?: string;
  wifiPassword?: string;
  wifiSecurity?: 'WPA2' | 'WPA3' | 'WEP' | 'Ochiq';

  // Shaxsiy hujjatlar (ID / Pasport)
  docType?: 'Pasport' | 'ID Karta' | 'Haydovchilik guvohnomasi' | 'Boshqa';
  docNumber?: string;

  // Xavfsizlik tarixi
  passwordHistory?: PasswordHistoryEntry[];

  // Ma'lumot yo'qolishidan himoya (Chiqindi Qutisi / Trash)
  isDeleted?: boolean;
  deletedAt?: number;

  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
}

export interface EncryptedVaultRecord {
  id: string;
  category: VaultCategory;
  title: string;
  encryptedData: string;
  isFavorite: number;
  isDeleted: number; // 0 = faol, 1 = chiqindi qutisida
  createdAt: number;
  updatedAt: number;
}

export interface VaultSnapshot {
  id: string;
  timestamp: number;
  label: string;
  itemCount: number;
  encryptedVault: string;
}

export interface PasswordGeneratorOptions {
  mode: 'random' | 'passphrase' | 'pin';
  length: number;
  wordCount?: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PasswordStrength {
  score: number;
  label: 'Juda Zaif' | 'Zaif' | 'O\'rtacha' | 'Kuchli' | 'Juda Mustahkam';
  color: string;
  entropy: number;
}

export interface PasswordAuditResult {
  totalCount: number;
  healthyCount: number;
  weakCount: number;
  reusedCount: number;
  scorePercent: number;
  weakItems: Array<{ id: string; title: string; reason: string }>;
  reusedItems: Array<{ password: string; titles: string[] }>;
}

export interface AppSettings {
  isConfigured: boolean;
  quickPin?: string;
  biometricsEnabled: boolean;
  autoLockMinutes: number;
  autoClearClipboardSeconds: number;
  preventScreenshots: boolean;
  theme: 'dark' | 'light' | 'system';
  recoveryKeyHash?: string;
}

export interface VaultBackup {
  version: number;
  exportedAt: number;
  appName: 'SecurePass';
  salt: string;
  encryptedVault: string;
}
