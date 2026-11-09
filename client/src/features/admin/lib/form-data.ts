export const readFormText = (f: FormData, k: string) => String(f.get(k) || '').trim();

export const readFormLines = (f: FormData, k: string) =>
  readFormText(f, k)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

export const readFormNumber = (f: FormData, k: string) => Number(f.get(k));

export const readFormPrice = (f: FormData, k = 'price') =>
  readFormText(f, k) === '' ? null : readFormNumber(f, k);
