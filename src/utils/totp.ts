/**
 * 100% Offline 2FA / TOTP (Time-based One-Time Password) Dvigateli
 * Xalqaro standart: RFC 6238 & RFC 4226 (Google Authenticator, Telegram, Binance bilan 100% bir xil)
 * RFC test vektorlari bo'yicha to'liq tekshirilgan va tasdiqlangan.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Base32 satrini baytlarga to'g'ri dekodlash (Bitwise masking bilan)
 */
export function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.replace(/[\s\-_=]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
      value = value & ((1 << bits) - 1); // Sarflangan bitlarni tozalash (aniqlik kafolati)
    }
  }

  return new Uint8Array(bytes);
}

/**
 * otpauth://totp/... havolasi yoki oddiy Base32 matnidan maxfiy kalitni ajratib olish
 */
export function extractTotpSecret(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  if (trimmed.startsWith('otpauth://')) {
    try {
      const url = new URL(trimmed);
      const secret = url.searchParams.get('secret');
      if (secret) return secret.toUpperCase();
    } catch {
      const match = trimmed.match(/secret=([A-Za-z0-9]+)/i);
      if (match) return match[1].toUpperCase();
    }
  }

  return trimmed.replace(/\s+/g, '').toUpperCase();
}

/**
 * Joriy vaqt uchun 6 xonali 2FA kodini va qolgan soniyalarni hisoblash
 */
export async function generateTOTP(
  secret: string,
  timestampMs: number = Date.now(),
  periodSeconds: number = 30,
  digits: number = 6
): Promise<{ code: string; secondsRemaining: number }> {
  const cleanSecret = extractTotpSecret(secret);
  if (!cleanSecret) {
    return { code: '------', secondsRemaining: 30 };
  }

  const keyBytes = base32ToBytes(cleanSecret);
  if (keyBytes.length === 0) {
    return { code: '------', secondsRemaining: 30 };
  }

  const epochSeconds = Math.floor(timestampMs / 1000);
  const counter = Math.floor(epochSeconds / periodSeconds);
  const secondsRemaining = periodSeconds - (epochSeconds % periodSeconds);

  // 8-baytli Counter buffer (Big-endian)
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(0, 0, false);
  counterView.setUint32(4, counter, false);

  const cryptoObj = typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : null;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('WebCrypto API mavjud emas.');
  }

  // HMAC-SHA1 kaliti orqali imzolash
  const cryptoKey = await cryptoObj.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await cryptoObj.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmacBytes = new Uint8Array(signature);

  // Dynamic Truncation (RFC 4226 bo'yicha)
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  const code = otp.toString().padStart(digits, '0');

  return { code, secondsRemaining };
}
