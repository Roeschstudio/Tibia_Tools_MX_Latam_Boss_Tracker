import fs from 'fs';
import path from 'path';

// Interfaces para el sistema de caché
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface TibiaDataCache {
  worlds: CacheEntry<any> | null;
  bosses: CacheEntry<any> | null;
  lastGlobalUpdate: number;
}

// Configuración del caché
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
const CACHE_FILE_PATH = path.join(process.cwd(), 'src/data/tibia-cache.json');

// Función para leer el caché desde el archivo
export function readCache(): TibiaDataCache {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.error('Error reading cache file:', error);
  }
  
  // Retornar caché vacío si no existe o hay error
  return {
    worlds: null,
    bosses: null,
    lastGlobalUpdate: 0
  };
}

// Función para escribir el caché al archivo
export function writeCache(cache: TibiaDataCache): void {
  try {
    // Asegurar que el directorio existe
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Error writing cache file:', error);
  }
}

// Función para verificar si una entrada del caché es válida
export function isCacheValid<T>(entry: CacheEntry<T> | null): boolean {
  if (!entry) return false;
  return Date.now() < entry.expiresAt;
}

// Función para crear una nueva entrada de caché
export function createCacheEntry<T>(data: T): CacheEntry<T> {
  const now = Date.now();
  return {
    data,
    timestamp: now,
    expiresAt: now + CACHE_DURATION
  };
}

// Función para obtener datos del caché o ejecutar una función de fetch
export async function getCachedData<T>(
  cacheKey: keyof Omit<TibiaDataCache, 'lastGlobalUpdate'>,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const cache = readCache();
  const entry = cache[cacheKey] as CacheEntry<T> | null;
  
  // Si el caché es válido, retornar los datos
  if (isCacheValid(entry)) {
    console.log(`Cache hit for ${cacheKey}`);
    return entry!.data;
  }
  
  // Si el caché no es válido, hacer fetch y actualizar
  console.log(`Cache miss for ${cacheKey}, fetching fresh data...`);
  try {
    const freshData = await fetchFunction();
    
    // Actualizar el caché
    cache[cacheKey] = createCacheEntry(freshData) as any;
    cache.lastGlobalUpdate = Date.now();
    writeCache(cache);
    
    return freshData;
  } catch (error) {
    // Si hay error y tenemos datos en caché (aunque expirados), usarlos
    if (entry) {
      console.warn(`Fetch failed for ${cacheKey}, using stale cache data`);
      return entry.data;
    }
    throw error;
  }
}

// Función para invalidar todo el caché
export function invalidateCache(): void {
  const emptyCache: TibiaDataCache = {
    worlds: null,
    bosses: null,
    lastGlobalUpdate: 0
  };
  writeCache(emptyCache);
}

// Función para obtener información del estado del caché
export function getCacheInfo(): {
  isValid: boolean;
  lastUpdate: Date | null;
  nextUpdate: Date | null;
  cacheAge: number;
} {
  const cache = readCache();
  const lastUpdate = cache.lastGlobalUpdate ? new Date(cache.lastGlobalUpdate) : null;
  const nextUpdate = cache.lastGlobalUpdate ? new Date(cache.lastGlobalUpdate + CACHE_DURATION) : null;
  const cacheAge = cache.lastGlobalUpdate ? Date.now() - cache.lastGlobalUpdate : 0;
  
  return {
    isValid: cache.lastGlobalUpdate > 0 && cacheAge < CACHE_DURATION,
    lastUpdate,
    nextUpdate,
    cacheAge
  };
}