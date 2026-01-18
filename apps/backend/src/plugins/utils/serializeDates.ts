// utils/serializeDates.ts
export function serializeDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeDates);
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serializeDates(v)]));
}
