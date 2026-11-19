import {
  VaultItem,
  EncryptedVaultRecord,
  AppSettings,
  VaultBackup,
  VaultCategory,
  VaultSnapshot,
} from '../types';
import {
  deriveKey,
  generateRandomSalt,
  hashPasswordForVerification,
  encryptData,
  decryptData,
  bufferToBase64,
  base64ToBuffer,
} from '../crypto/secureEngine';
import { generateTOTP } from '../utils/totp';

const STORAGE_KEYS = {
  SALT: 'sp_master_salt',
  HASH: 'sp_master_hash',
  PIN: 'sp_quick_pin',
  SETTINGS: 'sp_settings',
  VAULT: 'sp_vault_records',
  SNAPSHOTS: 'sp_vault_snapshots',
  RECOVERY_PAYLOAD: 'sp_recovery_payload',
  FAILED_ATTEMPTS: 'sp_failed_attempts',
  LOCKOUT_UNTIL: 'sp_lockout_until',
};

const DEFAULT_SETTINGS: AppSettings = {
  isConfigured: false,
  biometricsEnabled: true,
  autoLockMinutes: 1,
  autoClearClipboardSeconds: 30,
  preventScreenshots: true,
  theme: 'dark',
};

class OfflineVaultManager {
  private activeKey: CryptoKey | null = null;
  private currentSalt: Uint8Array | null = null;

  public lockVault(): void {
    this.activeKey = null;
  }

  public isUnlocked(): boolean {
    return this.activeKey !== null;
  }

  public async isConfigured(): Promise<boolean> {
    const hash = await this.readRawStorage(STORAGE_KEYS.HASH);
    return !!hash;
  }

  public async getLockoutTimeRemaining(): Promise<number> {
    const lockoutStr = await this.readRawStorage(STORAGE_KEYS.LOCKOUT_UNTIL);
    if (!lockoutStr) return 0;
    const lockoutUntil = parseInt(lockoutStr, 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      return Math.ceil((lockoutUntil - now) / 1000);
    }
    await this.removeRawStorage(STORAGE_KEYS.LOCKOUT_UNTIL);
    await this.removeRawStorage(STORAGE_KEYS.FAILED_ATTEMPTS);
    return 0;
  }

  private async recordFailedAttempt(): Promise<number> {
    const attemptsStr = await this.readRawStorage(STORAGE_KEYS.FAILED_ATTEMPTS);
    const attempts = (attemptsStr ? parseInt(attemptsStr, 10) : 0) + 1;
    await this.writeRawStorage(STORAGE_KEYS.FAILED_ATTEMPTS, attempts.toString());

    if (attempts >= 3) {
      const lockoutUntil = Date.now() + 30000;
      await this.writeRawStorage(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutUntil.toString());
      return 30;
    }
    return 0;
  }

  private async resetFailedAttempts(): Promise<void> {
    await this.removeRawStorage(STORAGE_KEYS.FAILED_ATTEMPTS);
    await this.removeRawStorage(STORAGE_KEYS.LOCKOUT_UNTIL);
  }

  /**
   * 24 belgili Favqulodda Tiklash Kalitini generatsiya qilish
   */
  public generateRecoveryKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = 'SECURE';
    for (let i = 0; i < 4; i++) {
      let block = '';
      for (let j = 0; j < 4; j++) {
        const rand = Math.floor(Math.random() * chars.length);
        block += chars[rand];
      }
      key += '-' + block;
    }
    return key;
  }

  public async setupMasterPassword(password: string): Promise<{ success: boolean; recoveryKey: string }> {
    const salt = generateRandomSalt();
    const hash = await hashPasswordForVerification(password, salt);
    const key = await deriveKey(password, salt);

    const recoveryKey = this.generateRecoveryKey();
    const recoverySalt = generateRandomSalt();
    const recoveryKeyDerivation = await deriveKey(recoveryKey, recoverySalt);
    const recoveryPayload = await encryptData({ verification: 'OK', salt: bufferToBase64(salt) }, recoveryKeyDerivation, recoverySalt);

    await this.writeRawStorage(STORAGE_KEYS.SALT, bufferToBase64(salt));
    await this.writeRawStorage(STORAGE_KEYS.HASH, hash);
    await this.writeRawStorage(STORAGE_KEYS.RECOVERY_PAYLOAD, JSON.stringify(recoveryPayload));
    await this.saveSettings({ ...DEFAULT_SETTINGS, isConfigured: true });

    this.currentSalt = salt;
    this.activeKey = key;
    await this.resetFailedAttempts();
    await this.saveAutoSnapshot('Dastur ilk bor sozlandi');

    return { success: true, recoveryKey };
  }

  public async unlockWithPassword(password: string): Promise<{ success: boolean; lockoutSeconds?: number }> {
    const remaining = await this.getLockoutTimeRemaining();
    if (remaining > 0) {
      return { success: false, lockoutSeconds: remaining };
    }

    const saltBase64 = await this.readRawStorage(STORAGE_KEYS.SALT);
    const storedHash = await this.readRawStorage(STORAGE_KEYS.HASH);

    if (!saltBase64 || !storedHash) {
      throw new Error("Master parol hali o'rnatilmagan.");
    }

    const salt = base64ToBuffer(saltBase64);
    const calculatedHash = await hashPasswordForVerification(password, salt);

    if (calculatedHash !== storedHash) {
      const lockout = await this.recordFailedAttempt();
      return { success: false, lockoutSeconds: lockout };
    }

    await this.resetFailedAttempts();
    this.currentSalt = salt;
    this.activeKey = await deriveKey(password, salt);
    return { success: true };
  }

  /**
   * Favqulodda Tiklash Kaliti orqali qulfni ochish va parolni tiklash
   */
  public async unlockWithRecoveryKey(recoveryKey: string, newPassword: string): Promise<boolean> {
    const rawPayload = await this.readRawStorage(STORAGE_KEYS.RECOVERY_PAYLOAD);
    if (!rawPayload) return false;

    try {
      const payload = JSON.parse(rawPayload);
      const salt = base64ToBuffer(payload.salt);
      const recKey = await deriveKey(recoveryKey.trim().toUpperCase(), salt);
      const data = await decryptData<{ verification: string; salt: string }>(payload, recKey);

      if (data && data.verification === 'OK') {
        // Yangi master parol o'rnatish
        await this.setupMasterPassword(newPassword);
        return true;
      }
    } catch (e) {
      console.error('Tiklash kaliti xatosi:', e);
    }
    return false;
  }

  /**
   * Barcha faol parollarni olish (Chiqindi qutisidagilarni hisobga olmasdan)
   */
  public async getAllItems(): Promise<VaultItem[]> {
    return this.getItemsInternal(false);
  }

  /**
   * Chiqindi Qutisidagi (Trash) parollarni olish
   */
  public async getTrashItems(): Promise<VaultItem[]> {
    return this.getItemsInternal(true);
  }

  private async getItemsInternal(isTrash: boolean): Promise<VaultItem[]> {
    if (!this.activeKey) {
      throw new Error('Ombor qulflangan!');
    }

    const rawRecords = await this.readRawStorage(STORAGE_KEYS.VAULT);
    if (!rawRecords) return [];

    const encryptedRecords: EncryptedVaultRecord[] = JSON.parse(rawRecords);
    const items: VaultItem[] = [];

    for (const record of encryptedRecords) {
      const isItemDeleted = record.isDeleted === 1;
      if (isItemDeleted !== isTrash) continue;

      try {
        const payload = JSON.parse(record.encryptedData);
        const decryptedItem = await decryptData<VaultItem>(payload, this.activeKey);
        items.push({
          ...decryptedItem,
          id: record.id,
          category: record.category,
          title: record.title,
          isFavorite: record.isFavorite === 1,
          isDeleted: isItemDeleted,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        });
      } catch (err) {
        console.error(`Deshifrlash xatosi (ID: ${record.id}):`, err);
      }
    }

    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Saqlash yoki Yangilash (Avtomatik zaxira snapshot bilan)
   */
  public async saveItem(item: Omit<VaultItem, 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: number }): Promise<VaultItem> {
    if (!this.activeKey || !this.currentSalt) {
      throw new Error('Ombor qulflangan.');
    }

    const now = Date.now();
    const id = item.id || 'item_' + now + '_' + Math.random().toString(36).substring(2, 9);
    const rawRecords = await this.readRawStorage(STORAGE_KEYS.VAULT);
    const records: EncryptedVaultRecord[] = rawRecords ? JSON.parse(rawRecords) : [];
    const existingIndex = records.findIndex(r => r.id === id);

    let passwordHistory = item.passwordHistory || [];

    if (existingIndex >= 0 && item.password) {
      try {
        const oldPayload = JSON.parse(records[existingIndex].encryptedData);
        const oldItem = await decryptData<VaultItem>(oldPayload, this.activeKey);
        if (oldItem.password && oldItem.password !== item.password) {
          passwordHistory = [
            { password: oldItem.password, changedAt: now },
            ...(oldItem.passwordHistory || [])
          ].slice(0, 5);
        }
      } catch (e) {}
    }

    const fullItem: VaultItem = {
      ...item,
      id,
      passwordHistory,
      isDeleted: false,
      createdAt: item.createdAt || (existingIndex >= 0 ? records[existingIndex].createdAt : now),
      updatedAt: now,
    };

    const encryptedPayload = await encryptData(fullItem, this.activeKey, this.currentSalt);

    const record: EncryptedVaultRecord = {
      id,
      category: item.category,
      title: item.title,
      encryptedData: JSON.stringify(encryptedPayload),
      isFavorite: item.isFavorite ? 1 : 0,
      isDeleted: 0,
      createdAt: fullItem.createdAt,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }

    await this.writeRawStorage(STORAGE_KEYS.VAULT, JSON.stringify(records));
    await this.saveAutoSnapshot(`Saqlandi: ${item.title}`);
    return fullItem;
  }

  /**
   * XAVFSIZ O'CHIRISH (Soft Delete):
   * Ma'lumot darhol yo'q qilinmaydi, "Chiqindi Qutisi"ga ko'chiriladi!
   * Xatolik bo'lsa istalgan payt 1 bosishda qaytarib olish mumkin.
   */
  public async moveToTrash(id: string): Promise<boolean> {
    const rawRecords = await this.readRawStorage(STORAGE_KEYS.VAULT);
    if (!rawRecords) return false;

    const records: EncryptedVaultRecord[] = JSON.parse(rawRecords);
    const index = records.findIndex(r => r.id === id);
    if (index >= 0) {
      records[index].isDeleted = 1;
      records[index].updatedAt = Date.now();
      await this.writeRawStorage(STORAGE_KEYS.VAULT, JSON.stringify(records));
      await this.saveAutoSnapshot(`Chiqindiga ko'chirildi: ${records[index].title}`);
      return true;
    }
    return false;
  }

  /**
   * Chiqindi qutisidan qayta tiklash (Restore)
   */
  public async restoreFromTrash(id: string): Promise<boolean> {
    const rawRecords = await this.readRawStorage(STORAGE_KEYS.VAULT);
    if (!rawRecords) return false;

    const records: EncryptedVaultRecord[] = JSON.parse(rawRecords);
    const index = records.findIndex(r => r.id === id);
    if (index >= 0) {
      records[index].isDeleted = 0;
      records[index].updatedAt = Date.now();
      await this.writeRawStorage(STORAGE_KEYS.VAULT, JSON.stringify(records));
      await this.saveAutoSnapshot(`Tiklandi: ${records[index].title}`);
      return true;
    }
    return false;
  }

  /**
   * Chiqindi Qutisini butunlay tozalash (Faqat foydalanuvchi xohlasa)
   */
  public async permanentlyDeleteItem(id: string): Promise<boolean> {
    const rawRecords = await this.readRawStorage(STORAGE_KEYS.VAULT);
    if (!rawRecords) return false;

    let records: EncryptedVaultRecord[] = JSON.parse(rawRecords);
    const initialLen = records.length;
    records = records.filter(r => r.id !== id);

    if (records.length !== initialLen) {
      await this.writeRawStorage(STORAGE_KEYS.VAULT, JSON.stringify(records));
      await this.saveAutoSnapshot(`Butunlay o'chirildi (ID: ${id})`);
      return true;
    }
    return false;
  }

  // --- AVTOMATIK MAHALLIY SNAPSHOTLAR (RESTORE POINTS) ---
  public async getSnapshots(): Promise<VaultSnapshot[]> {
    const raw = await this.readRawStorage(STORAGE_KEYS.SNAPSHOTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public async saveAutoSnapshot(label: string): Promise<void> {
    try {
      const rawVault = await this.readRawStorage(STORAGE_KEYS.VAULT);
      const records: EncryptedVaultRecord[] = rawVault ? JSON.parse(rawVault) : [];
      const snapshots = await this.getSnapshots();

      const newSnapshot: VaultSnapshot = {
        id: 'snap_' + Date.now(),
        timestamp: Date.now(),
        label,
        itemCount: records.filter(r => r.isDeleted === 0).length,
        encryptedVault: rawVault || '[]',
      };

      // Oxirgi 15 ta avto-tiklash nuqtasini saqlash
      const updated = [newSnapshot, ...snapshots].slice(0, 15);
      await this.writeRawStorage(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(updated));
    } catch (e) {
      console.error('Snapshot yaratishda xatolik:', e);
    }
  }

  public async rollbackToSnapshot(snapshotId: string): Promise<boolean> {
    const snapshots = await this.getSnapshots();
    const found = snapshots.find(s => s.id === snapshotId);
    if (!found) return false;

    await this.writeRawStorage(STORAGE_KEYS.VAULT, found.encryptedVault);
    await this.saveAutoSnapshot(`Orqaga qaytarildi: ${found.label}`);
    return true;
  }

  public async exportToPlainText(): Promise<string> {
    const items = await this.getAllItems();
    const dateStr = new Date().toLocaleString();

    let txt = `======================================================================\n`;
    txt += `          SECUREPASS - MAXFIY PAROLLAR VA 2FA HISOBOTI (.TXT)        \n`;
    txt += `Yaratilgan vaqt: ${dateStr}\n`;
    txt += `Jami faol yozuvlar: ${items.length} ta\n`;
    txt += `DIQQAT: Ushbu fayl shifrlanmagan ochiq matn ko'rinishida!            \n`;
    txt += `Uni faqat ishonchli joyda saqlang va begonalarga bermang.           \n`;
    txt += `======================================================================\n\n`;

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      txt += `[${index + 1}] ${item.title.toUpperCase()} (${item.category.toUpperCase()})\n`;
      txt += `----------------------------------------------------------------------\n`;

      if (item.category === 'login') {
        if (item.username) txt += `Login / Email: ${item.username}\n`;
        if (item.password) txt += `Parol:         ${item.password}\n`;
        if (item.totpSecret) {
          try {
            const totp = await generateTOTP(item.totpSecret);
            txt += `2FA Kaliti:    ${item.totpSecret}\n`;
            txt += `2FA Joriy Kod: ${totp.code} (30s)\n`;
          } catch {
            txt += `2FA Kaliti:    ${item.totpSecret}\n`;
          }
        }
        if (item.url)      txt += `Sayt / Manzil: ${item.url}\n`;
      } else if (item.category === 'card') {
        if (item.cardNumber) txt += `Karta raqami:  ${item.cardNumber}\n`;
        if (item.cardHolder) txt += `Karta egasi:   ${item.cardHolder}\n`;
        if (item.expiryDate) txt += `Amal muddati:  ${item.expiryDate}\n`;
        if (item.cvv)        txt += `CVV / CVC:     ${item.cvv}\n`;
        if (item.pin)        txt += `PIN-kod:       ${item.pin}\n`;
      } else if (item.category === 'wifi') {
        if (item.wifiSsid)     txt += `Wi-Fi nomi:    ${item.wifiSsid}\n`;
        if (item.wifiPassword) txt += `Wi-Fi paroli:  ${item.wifiPassword}\n`;
        if (item.wifiSecurity) txt += `Xavfsizlik:    ${item.wifiSecurity}\n`;
      } else if (item.category === 'id_doc') {
        if (item.docType)   txt += `Hujjat turi:   ${item.docType}\n`;
        if (item.docNumber) txt += `Hujjat raqami: ${item.docNumber}\n`;
      }

      if (item.notes) {
        txt += `Maxfiy izoh:   ${item.notes}\n`;
      }
      txt += `\n`;
    }

    return txt;
  }

  public async importFromCsv(csvContent: string): Promise<number> {
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return 0;

    let importedCount = 0;
    const startIndex = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('url') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 2) {
        const title = cols[0] || 'Imported ' + (i + 1);
        const url = cols[1] || '';
        const username = cols[2] || '';
        const password = cols[3] || cols[1] || '';
        const totpSecret = cols[4] || undefined;

        await this.saveItem({
          category: 'login',
          title,
          url: url.startsWith('http') ? url : undefined,
          username: username || undefined,
          password: password || undefined,
          totpSecret: totpSecret || undefined,
          isFavorite: false,
        });
        importedCount++;
      }
    }

    return importedCount;
  }

  public async getSettings(): Promise<AppSettings> {
    const raw = await this.readRawStorage(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public async saveSettings(settings: AppSettings): Promise<void> {
    await this.writeRawStorage(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  public async exportEncryptedBackup(): Promise<VaultBackup> {
    const saltBase64 = await this.readRawStorage(STORAGE_KEYS.SALT);
    const encryptedVault = await this.readRawStorage(STORAGE_KEYS.VAULT);

    return {
      version: 2,
      appName: 'SecurePass',
      exportedAt: Date.now(),
      salt: saltBase64 || '',
      encryptedVault: encryptedVault || '[]',
    };
  }

  public async wipeAllData(): Promise<void> {
    this.lockVault();
    await this.removeRawStorage(STORAGE_KEYS.SALT);
    await this.removeRawStorage(STORAGE_KEYS.HASH);
    await this.removeRawStorage(STORAGE_KEYS.PIN);
    await this.removeRawStorage(STORAGE_KEYS.SETTINGS);
    await this.removeRawStorage(STORAGE_KEYS.VAULT);
    await this.removeRawStorage(STORAGE_KEYS.SNAPSHOTS);
    await this.removeRawStorage(STORAGE_KEYS.RECOVERY_PAYLOAD);
    await this.removeRawStorage(STORAGE_KEYS.FAILED_ATTEMPTS);
    await this.removeRawStorage(STORAGE_KEYS.LOCKOUT_UNTIL);
  }

  private async readRawStorage(key: string): Promise<string | null> {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  private async writeRawStorage(key: string, value: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private async removeRawStorage(key: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}

export const offlineVault = new OfflineVaultManager();
