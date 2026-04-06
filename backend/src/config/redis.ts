const store = new Map<string, string>();
const hashStore = new Map<string, Map<string, string>>();

export const connectRedis = async () => { console.log('Mock Redis connected (In-Memory)'); };

export default {
  get: async (key: string) => store.get(key) || null,
  set: async (key: string, val: string) => { store.set(key, val); },
  setEx: async (key: string, exp: number, val: string) => { store.set(key, val); },
  del: async (key: string) => { store.delete(key); hashStore.delete(key); },
  expire: async (key: string, exp: number) => {},
  hGet: async (key: string, field: string) => {
    const hash = hashStore.get(key);
    return hash ? (hash.get(field) || null) : null;
  },
  hSet: async (key: string, field: string, val: string) => {
    let hash = hashStore.get(key);
    if (!hash) {
      hash = new Map<string, string>();
      hashStore.set(key, hash);
    }
    hash.set(field, val);
  },
  hGetAll: async (key: string) => {
    const hash = hashStore.get(key);
    if (!hash) return {};
    const obj: Record<string, string> = {};
    for (const [k, v] of hash.entries()) obj[k] = v;
    return obj;
  },
  on: () => {}
} as any;
