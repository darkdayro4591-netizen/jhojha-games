/**
 * Dynamic game catalog hook.
 * Fetches games from /api/games and normalises the snake_case API response
 * to the camelCase shape used by all frontend components.
 *
 * Module-level cache: multiple components share one fetch, zero duplicate requests.
 */
import { useState, useEffect } from 'react';
import fallbackGamesData from '../data/games';

export interface Game {
  id: number;
  title: string;
  category: string;
  image: string;         // from image_url
  salePrice: number;     // from sale_price
  originalPrice: number; // from original_price
  discount: number;
  rating: number;
  badge?: string | null;
  description: string;
  steamUrl?: string | null;  // from steam_url
  isFeatured: boolean;       // from is_featured
  inStock: boolean;          // from in_stock
}

function normalize(row: Record<string, unknown>): Game {
  return {
    id:            Number(row.id),
    title:         String(row.title),
    category:      String(row.category),
    image:         String(row.image_url || ''),
    salePrice:     parseFloat(String(row.sale_price)),
    originalPrice: parseFloat(String(row.original_price)),
    discount:      Number(row.discount),
    rating:        Number(row.rating),
    badge:         (row.badge as string | null) ?? null,
    description:   String(row.description || ''),
    steamUrl:      (row.steam_url as string | null) ?? null,
    isFeatured:    !!row.is_featured,
    inStock:       !!row.in_stock,
  };
}

function normalizeFallbackGame(game: typeof fallbackGamesData[number]): Game {
  return {
    id:            game.id,
    title:         game.title,
    category:      game.category,
    image:         game.image,
    salePrice:     game.salePrice,
    originalPrice: game.originalPrice,
    discount:      game.discount,
    rating:        game.rating,
    badge:         game.badge ?? null,
    description:   game.description,
    steamUrl:      null,
    isFeatured:    true,
    inStock:       true,
  };
}

// Module-level cache
let _cache:    Game[] | null         = null;
let _inflight: Promise<Game[]> | null = null;

async function fetchGamesCached(): Promise<Game[]> {
  if (_cache) return _cache;
  if (!_inflight) {
    _inflight = fetch('/api/games')
      .then(r => r.json())
      .then((rows: Record<string, unknown>[]) => {
        const normalized = Array.isArray(rows) ? rows.map(normalize) : [];
        _cache = normalized.length > 0 ? normalized : fallbackGamesData.map(normalizeFallbackGame);
        _inflight = null;
        return _cache!;
      })
      .catch(() => {
        _inflight = null;
        return fallbackGamesData.map(normalizeFallbackGame);
      });
  }
  return _inflight;
}

/** Call after admin creates/edits/deletes a game so all components refetch. */
export function invalidateGamesCache() {
  _cache    = null;
  _inflight = null;
}

export function useGames() {
  const [games,   setGames]   = useState<Game[]>(_cache || []);
  const [loading, setLoading] = useState(!_cache);
  const [error,   setError]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchGamesCached();
      setGames(data);
      setError(null);
    } catch {
      setError('Failed to load games');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    games,
    loading,
    error,
    /** Bust the cache and reload from the server. */
    refetch: () => { invalidateGamesCache(); load(); },
  };
}
