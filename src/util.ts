export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getZeroIndexes(lst: number[]): number[] {
  return lst.reduce((m: number[], v, i) => (v === 0 ? [...m, i] : m), []);
}

export function getRandomElement<T>(lst: T[]): T {
  const idx = Math.floor(Math.random() * lst.length);
  return lst[idx];
}
