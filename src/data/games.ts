export interface Game {
  id: number;
  title: string;
  category: string;
  image: string;
  salePrice: number;
  originalPrice: number;
  discount: number;
  rating: number;
  badge?: string;
  description: string;
}

const games: Game[] = [
  {
    id: 1,
    title: 'GTA VI Pre-Order',
    category: 'Action',
    image: '/gta6-cover.jpeg',
    salePrice: 5999,
    originalPrice: 7999,
    discount: 25,
    rating: 5,
    badge: 'PRE-ORDER',
    description: 'Pre-order Grand Theft Auto VI and get access to upcoming bonus content and launch perks.',
  },
  {
    id: 2,
    title: 'The Last of Us Part I',
    category: 'RPG',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/library_600x900.jpg',
    salePrice: 279,
    originalPrice: 999,
    discount: 72,
    rating: 5,
    description: 'Experience the emotional journey of Joel and Ellie in this acclaimed survival adventure.',
  },
  {
    id: 3,
    title: 'The Last of Us Part II',
    category: 'RPG',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2531310/library_600x900.jpg',
    salePrice: 329,
    originalPrice: 1299,
    discount: 75,
    rating: 5,
    description: 'Continue the gripping survival story with Ellie in this intense sequel.',
  },
  {
    id: 4,
    title: 'Resident Evil 4',
    category: 'Horror',
    image: '/re-requiem-cover.jpeg',
    salePrice: 499,
    originalPrice: 1999,
    discount: 75,
    rating: 5,
    description: 'A tense survival-horror classic with action-heavy combat and atmospheric terror.',
  },
  {
    id: 5,
    title: 'Resident Evil Village',
    category: 'Horror',
    image: '/re-requiem-cover.jpeg',
    salePrice: 549,
    originalPrice: 1999,
    discount: 72,
    rating: 5,
    description: 'Return to a gothic village full of horror, mystery, and relentless enemies.',
  },
  {
    id: 6,
    title: 'God of War',
    category: 'Action',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/library_600x900.jpg',
    salePrice: 699,
    originalPrice: 1999,
    discount: 65,
    rating: 5,
    badge: 'HOT DEAL',
    description: 'Join Kratos on a brutal and emotional journey through Norse mythology.',
  },
  {
    id: 7,
    title: 'God of War Ragnarök',
    category: 'Action',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/library_600x900.jpg',
    salePrice: 899,
    originalPrice: 2499,
    discount: 64,
    rating: 5,
    badge: 'NEW',
    description: 'The epic continuation of Kratos and Atreus in the Norse saga.',
  },
  {
    id: 8,
    title: 'Outlast Trials',
    category: 'Horror',
    image: '/outlast-trials-cover.jpeg',
    salePrice: 499,
    originalPrice: 1799,
    discount: 72,
    rating: 4,
    description: 'Survive the Murkoff Corporation’s twisted experiments in this terrifying co-op horror experience.',
  },
  {
    id: 9,
    title: 'Forza Horizon Series',
    category: 'Racing',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg',
    salePrice: 349,
    originalPrice: 1599,
    discount: 78,
    rating: 5,
    description: 'The latest Forza Horizon installment with hundreds of cars and open-world racing.',
  },
  {
    id: 10,
    title: "Assassin's Creed Black Flag Resynced",
    category: 'Open World',
    image: '/ac-black-flag-cover.jpeg',
    salePrice: 799,
    originalPrice: 1499,
    discount: 47,
    rating: 4,
    badge: 'PRE-ORDER',
    description: 'Sail the Caribbean as Edward Kenway in this remastered pirate adventure.',
  },
];

export default games;
