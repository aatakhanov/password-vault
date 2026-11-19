import { PasswordGeneratorOptions } from '../types';

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_REGEX = /[0Oo1lI]/g;

// 100% Offline o'zbekcha va universal so'zlar ro'yxati (Passphrase uchun)
const OFFLINE_WORDLIST = [
  'quyosh', 'yulduz', 'osmon', 'dengiz', 'toglar', 'shamol', 'daryo', 'olmos',
  'burgut', 'sher', 'tulpor', 'qoplon', 'chinor', 'lolazor', 'saroy', 'qalqon',
  'qilich', 'kamalak', 'bahor', 'zamon', 'alvon', 'mergan', 'pahlavon', 'ummon',
  'yurak', 'qudrat', 'parvoz', 'sadoqat', 'matonat', 'oftob', 'gulsan', 'anhor'
];

export const DEFAULT_GENERATOR_OPTIONS: PasswordGeneratorOptions = {
  mode: 'random',
  length: 16,
  wordCount: 4,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
};

function getSecureRandomInt(max: number): number {
  const cryptoObj = typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : null;
  if (!cryptoObj) {
    return Math.floor(Math.random() * max);
  }
  const array = new Uint32Array(1);
  cryptoObj.getRandomValues(array);
  return array[0] % max;
}

/**
 * Tasodifiy belgilar asosidagi murakkab parol
 */
export function generateRandomPassword(opts: PasswordGeneratorOptions): string {
  let upper = UPPERCASE_CHARS;
  let lower = LOWERCASE_CHARS;
  let numbers = NUMBER_CHARS;
  let symbols = SYMBOL_CHARS;

  if (opts.excludeAmbiguous) {
    upper = upper.replace(AMBIGUOUS_REGEX, '');
    lower = lower.replace(AMBIGUOUS_REGEX, '');
    numbers = numbers.replace(AMBIGUOUS_REGEX, '');
  }

  let charPool = '';
  const mandatoryChars: string[] = [];

  if (opts.includeUppercase && upper.length > 0) {
    charPool += upper;
    mandatoryChars.push(upper[getSecureRandomInt(upper.length)]);
  }
  if (opts.includeLowercase && lower.length > 0) {
    charPool += lower;
    mandatoryChars.push(lower[getSecureRandomInt(lower.length)]);
  }
  if (opts.includeNumbers && numbers.length > 0) {
    charPool += numbers;
    mandatoryChars.push(numbers[getSecureRandomInt(numbers.length)]);
  }
  if (opts.includeSymbols && symbols.length > 0) {
    charPool += symbols;
    mandatoryChars.push(symbols[getSecureRandomInt(symbols.length)]);
  }

  if (charPool.length === 0) charPool = lower + numbers;

  const length = Math.max(4, Math.min(64, opts.length || 16));
  const passwordChars: string[] = [...mandatoryChars];

  while (passwordChars.length < length) {
    const randomIndex = getSecureRandomInt(charPool.length);
    passwordChars.push(charPool[randomIndex]);
  }

  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = passwordChars[i];
    passwordChars[i] = passwordChars[j];
    passwordChars[j] = temp;
  }

  return passwordChars.join('');
}

/**
 * Eslab qolish oson so'zli parol (Passphrase: masalan, "quyosh-sher-daryo-2026!")
 */
export function generatePassphrase(wordCount = 4): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = getSecureRandomInt(OFFLINE_WORDLIST.length);
    let word = OFFLINE_WORDLIST[idx];
    if (i === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }
  const randomNum = 100 + getSecureRandomInt(900);
  const symbols = ['!', '@', '#', '$', '%', '*', '?'];
  const symbol = symbols[getSecureRandomInt(symbols.length)];
  return words.join('-') + '-' + randomNum + symbol;
}

/**
 * 4 yoki 6 xonali PIN kod
 */
export function generatePin(length = 4): string {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += getSecureRandomInt(10).toString();
  }
  return pin;
}

export function generatePassword(options: Partial<PasswordGeneratorOptions> = {}): string {
  const opts: PasswordGeneratorOptions = { ...DEFAULT_GENERATOR_OPTIONS, ...options };
  if (opts.mode === 'passphrase') {
    return generatePassphrase(opts.wordCount || 4);
  }
  if (opts.mode === 'pin') {
    return generatePin(opts.length || 4);
  }
  return generateRandomPassword(opts);
}
