import { PasswordStrength } from '../types';

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return {
      score: 0,
      label: 'Juda Zaif',
      color: '#EF4444', // Red
      entropy: 0,
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) poolSize = 10;

  // Entropiya: E = L * log2(R)
  const entropy = Math.round(password.length * (Math.log(poolSize) / Math.log(2)));

  let score = 0;
  let label: PasswordStrength['label'] = 'Juda Zaif';
  let color = '#EF4444';

  if (entropy < 28 || password.length < 6) {
    score = 0;
    label = 'Juda Zaif';
    color = '#EF4444'; // Red
  } else if (entropy < 45 || password.length < 8) {
    score = 1;
    label = 'Zaif';
    color = '#F97316'; // Orange
  } else if (entropy < 65 || password.length < 12) {
    score = 2;
    label = "O'rtacha";
    color = '#EAB308'; // Yellow
  } else if (entropy < 85 || password.length < 16) {
    score = 3;
    label = 'Kuchli';
    color = '#22C55E'; // Green
  } else {
    score = 4;
    label = 'Juda Mustahkam';
    color = '#10B981'; // Emerald
  }

  return {
    score,
    label,
    color,
    entropy,
  };
}
