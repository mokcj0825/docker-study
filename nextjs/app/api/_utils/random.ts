/**
 * Random number and data generation utilities
 */

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random boolean
 */
export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

/**
 * Pick a random element from an array
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Pick multiple random elements from an array (without duplicates)
 */
export function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generate a random string of specified length
 */
export function randomString(length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random alphanumeric code
 */
export function randomCode(prefix: string = '', length: number = 6): string {
  const code = randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  return prefix ? `${prefix}${code}` : code;
}

/**
 * Generate a random UUID v4-like string
 */
export function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a random date between two dates
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a random past date (within specified days)
 */
export function randomPastDate(daysAgo: number = 365): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return randomDate(pastDate, now);
}

/**
 * Generate a random future date (within specified days)
 */
export function randomFutureDate(daysAhead: number = 365): Date {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return randomDate(now, futureDate);
}

/**
 * Generate random person data
 */
export function randomPerson() {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
  const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Toronto', 'Berlin', 'Dubai', 'Singapore', 'Mumbai'];
  
  return {
    firstName: randomChoice(firstNames),
    lastName: randomChoice(lastNames),
    age: randomInt(20, 70),
    city: randomChoice(cities),
    email: `${randomString(8, 'abcdefghijklmnopqrstuvwxyz0123456789')}@example.com`
  };
}

/**
 * Generate random user data
 */
export function randomUser() {
  const person = randomPerson();
  return {
    ...person,
    id: randomUUID(),
    username: `${person.firstName.toLowerCase()}_${randomString(5)}`,
    createdAt: randomPastDate(365)
  };
}

