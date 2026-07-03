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
    title: 'GTA VI Pre-Order Standard Edition',
    category: 'Action',
    image: '/gta6-cover.jpeg',
    salePrice: 5999,
    originalPrice: 7999,
    discount: 25,
    rating: 5,
    badge: 'PRE-ORDER',
    description: 'Pre-order Grand Theft Auto VI Standard Edition and get exclusive bonus content including in-game currency and special vehicles.',
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
    description: 'Experience the emotional journey of Joel and Ellie in this stunning remake of the critically acclaimed survival game.',
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
    description: 'Continue the gripping story with Ellie in this intense, emotional sequel set in a post-apocalyptic world.',
  },
  {
    id: 4,
    title: 'Resident Evil Requiem',
    category: 'Horror',
    image: '/re-requiem-cover.jpeg',
    salePrice: 499,
    originalPrice: 1999,
    discount: 75,
    rating: 5,
    description: 'Face your fears in the latest Resident Evil installment. Survival horror at its finest with stunning visuals.',
  },
  {
    id: 5,
    title: "Assassin's Creed Black Flag Resynced Pre-Order",
    category: 'Open World',
    image: '/ac-black-flag-cover.jpeg',
    salePrice: 799,
    originalPrice: 1499,
    discount: 47,
    rating: 4,
    badge: 'PRE-ORDER',
    description: "Pre-order the Resynced edition of the beloved pirate adventure. Sail the Caribbean as Edward Kenway with enhanced graphics.",
  },
  {
    id: 6,
    title: 'Forza Horizon Series',
    category: 'Racing',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900.jpg',
    salePrice: 349,
    originalPrice: 1599,
    discount: 78,
    rating: 5,
    description: 'The latest Forza Horizon installment with hundreds of cars, open-world racing, and stunning next-gen graphics.',
  },
  {
    id: 7,
    title: 'Outlast Trials',
    category: 'Horror',
    image: '/outlast-trials-cover.jpeg',
    salePrice: 499,
    originalPrice: 1799,
    discount: 72,
    rating: 4,
    description: "Survive the Murkoff Corporation's twisted experiments in this terrifying co-op horror experience.",
  },
];

export default games;
