import { EncryptedPayload } from '../types';

/**
 * 100% Offline Kriptografik Xavfsizlik Dvigateli (Zero-Knowledge Engine)
 * Hech qanday ma'lumot tashqi serverga chiqmaydi.
 * Shifrlash standarti: AES-256-GCM
 * Kalit hosil qilish: PBKDF2 (SHA-256, 120,000 iteratsiya)
 */

const PBKDF2_ITERATIONS = 120000;
const KEY_LENGTH_BITS = 256;
const IV_LENGTH_BYTES = 12; // AES-GCM uchun 96-bit (12 bytes) tavsiya etiladi
const SALT_LENGTH_BYTES = 16;

function getCrypto(): Crypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  throw new Error('Xavfsiz WebCrypto API mavjud emas.');
}

export function generateRandomSalt(): Uint8Array {
  const cryptoObj = getCrypto();
  const salt = new Uint8Array(SALT_LENGTH_BYTES);
  cryptoObj.getRandomValues(salt);
  return salt;
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Master paroldan AES-256 shifrlash kalitini hosil qilish (Key Derivation)
 */
export async function deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const passwordKey = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey', 'deriveBits']
  );

  return await cryptoObj.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Master parol xeshini yaratish (Faqat to'g'ri parolni tekshirish uchun)
 */
export async function hashPasswordForVerification(password: string, salt: Uint8Array): Promise<string> {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const passwordKey = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await cryptoObj.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  return bufferToBase64(derivedBits);
}

/**
 * Obyekt yoki matnni AES-256-GCM orqali shifrlash
 */
export async function encryptData<T>(data: T, key: CryptoKey, salt: Uint8Array): Promise<EncryptedPayload> {
  const cryptoObj = getCrypto();
  const iv = new Uint8Array(IV_LENGTH_BYTES);
  cryptoObj.getRandomValues(iv);

  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(data));

  const ciphertextBuffer = await cryptoObj.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encodedData
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
}

/**
 * Shifrlangan ma'lumotni AES-256-GCM orqali ochish (deshifrlash)
 */
export async function decryptData<T>(payload: EncryptedPayload, key: CryptoKey): Promise<T> {
  const cryptoObj = getCrypto();
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const decryptedBuffer = await cryptoObj.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    ciphertext as BufferSource
  );

  const dec = new TextDecoder();
  const jsonString = dec.decode(decryptedBuffer);
  return JSON.parse(jsonString) as T;
}
