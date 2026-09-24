import { compare, hash } from 'bcrypt';

export async function hashPassword(plainPassword: string, saltRounds: number): Promise<string> {
  return hash(plainPassword, saltRounds);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(plainPassword, hashedPassword);
}

export function generateTemporaryPassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';
  const all = upper + lower + digits + symbols;

  const pick = (set: string): string => set[Math.floor(Math.random() * set.length)];

  const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const rest: string[] = [];
  for (let i = required.length; i < length; i += 1) {
    rest.push(pick(all));
  }

  const combined = [...required, ...rest];
  for (let i = combined.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}