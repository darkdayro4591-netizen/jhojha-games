import { useState, useEffect, useCallback } from 'react';
import type { SteamGameData } from '../lib/steamApi';

const STORAGE_KEY = 'jhojha_steam_catalog';

export interface CatalogEntry extends SteamGameData {
  uid: string;
  jhojhaPrice: number;
  jhojhaOriginalPrice: number;
  badge: string;
  addedAt: number;
}

function load(): CatalogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(entries: CatalogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useSteamCatalog() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>(load);

  useEffect(() => {
    save(catalog);
  }, [catalog]);

  const addGame = useCallback(
    (data: SteamGameData, jhojhaPrice: number, jhojhaOriginalPrice: number, badge: string) => {
      const entry: CatalogEntry = {
        ...data,
        uid: `${data.appId}-${Date.now()}`,
        jhojhaPrice,
        jhojhaOriginalPrice,
        badge,
        addedAt: Date.now(),
      };
      setCatalog(prev => {
        const filtered = prev.filter(e => e.appId !== data.appId);
        return [entry, ...filtered];
      });
      return entry;
    },
    []
  );

  const removeGame = useCallback((uid: string) => {
    setCatalog(prev => prev.filter(e => e.uid !== uid));
  }, []);

  const clearAll = useCallback(() => {
    setCatalog([]);
  }, []);

  return { catalog, addGame, removeGame, clearAll };
}
