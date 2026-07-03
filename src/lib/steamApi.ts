export interface SteamGameData {
  appId: number;
  title: string;
  image: string;
  screenshots: string[];
  description: string;
  releaseDate: string;
  steamPrice: string;
  steamOriginalPrice: string;
  steamDiscountPct: number;
  isFree: boolean;
}

export function extractAppId(input: string): number | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/store\.steampowered\.com\/app\/(\d+)/);
  if (urlMatch) return parseInt(urlMatch[1], 10);
  const numMatch = trimmed.match(/^\d+$/);
  if (numMatch) return parseInt(trimmed, 10);
  return null;
}

export async function fetchSteamGame(appId: number): Promise<SteamGameData> {
  const res = await fetch(
    `/api/steam/appdetails?appids=${appId}&cc=in&l=english`,
    { headers: { Accept: 'application/json' } }
  );

  if (!res.ok) throw new Error(`Steam API error: ${res.status}`);

  const json = await res.json();
  const entry = json[String(appId)];

  if (!entry?.success) throw new Error('Game not found or unavailable in your region.');

  const d = entry.data;

  const price = d.price_overview;
  const steamPrice = price ? price.final_formatted : (d.is_free ? 'Free to Play' : 'N/A');
  const steamOriginalPrice = price ? price.initial_formatted : '';
  const steamDiscountPct = price ? price.discount_percent : 0;

  const screenshots: string[] = (d.screenshots ?? [])
    .slice(0, 6)
    .map((s: { path_full: string }) => s.path_full);

  return {
    appId,
    title: d.name,
    image: d.header_image,
    screenshots,
    description: d.short_description ?? '',
    releaseDate: d.release_date?.date ?? 'TBA',
    steamPrice,
    steamOriginalPrice,
    steamDiscountPct,
    isFree: d.is_free ?? false,
  };
}
