import { VaultItem, PasswordAuditResult } from '../types';
import { calculatePasswordStrength } from './strength';

export function runPasswordAudit(items: VaultItem[]): PasswordAuditResult {
  const passwordItems = items.filter(i => !!i.password);
  const totalCount = passwordItems.length;

  if (totalCount === 0) {
    return {
      totalCount: 0,
      healthyCount: 0,
      weakCount: 0,
      reusedCount: 0,
      scorePercent: 100,
      weakItems: [],
      reusedItems: [],
    };
  }

  const weakItems: Array<{ id: string; title: string; reason: string }> = [];
  const passwordMap = new Map<string, string[]>();

  for (const item of passwordItems) {
    const pwd = item.password!;
    const strength = calculatePasswordStrength(pwd);

    if (strength.score < 2 || pwd.length < 8) {
      weakItems.push({
        id: item.id,
        title: item.title,
        reason: pwd.length < 8 ? "Juda qisqa (< 8 belgi)" : "Zaif murakkablik darajasi",
      });
    }

    const currentTitles = passwordMap.get(pwd) || [];
    currentTitles.push(item.title);
    passwordMap.set(pwd, currentTitles);
  }

  const reusedItems: Array<{ password: string; titles: string[] }> = [];
  let reusedPasswordCount = 0;

  passwordMap.forEach((titles, pwd) => {
    if (titles.length > 1) {
      reusedItems.push({ password: pwd, titles });
      reusedPasswordCount += titles.length;
    }
  });

  const weakCount = weakItems.length;
  const reusedCount = reusedPasswordCount;

  // Xavfsizlik koeffitsienti
  let penalty = (weakCount * 15) + (reusedCount * 20);
  let scorePercent = Math.max(0, Math.min(100, 100 - Math.round(penalty / Math.max(1, totalCount))));

  const healthyCount = Math.max(0, totalCount - weakCount - reusedCount);

  return {
    totalCount,
    healthyCount,
    weakCount,
    reusedCount,
    scorePercent,
    weakItems,
    reusedItems,
  };
}
