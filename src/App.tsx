import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CountdownTimer from './components/CountdownTimer';
import FeaturedDeals from './components/FeaturedDeals';
import GameCategories from './components/GameCategories';
import FeaturedGames from './components/FeaturedGames';
import WhyChooseUs from './components/WhyChooseUs';
import Stats from './components/Stats';
import OrderProcess from './components/OrderProcess';
import Reviews from './components/Reviews';
import FAQ from './components/FAQ';
import PaymentSection from './components/PaymentSection';
import InstagramSection from './components/InstagramSection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import TelegramButton from './components/TelegramButton';
import StoreCatalog from './components/StoreCatalog';
import SteamImport from './components/SteamImport';
import { useSteamCatalog } from './hooks/useSteamCatalog';
import { Plus } from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [showImport, setShowImport] = useState(false);

  const { catalog, addGame, removeGame } = useSteamCatalog();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <Hero />
        <CountdownTimer />
        <FeaturedDeals />
        <GameCategories onSelectCategory={handleCategorySelect} />
        <FeaturedGames searchQuery={searchQuery} externalCategory={selectedCategory} />
        {catalog.length > 0 && (
          <StoreCatalog catalog={catalog} onRemove={removeGame} isAdmin={true} />
        )}
        <WhyChooseUs />
        <Stats />
        <OrderProcess />
        <Reviews />
        <FAQ />
        <PaymentSection />
        <InstagramSection />
        <Contact />
      </main>
      <Footer />
      <TelegramButton />

      {/* Floating Steam Import button */}
      <button
        onClick={() => setShowImport(true)}
        title="Import game from Steam"
        className="fixed bottom-24 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1b2838] to-[#2a475e] border border-[#66c0f4]/40 text-[#66c0f4] font-rajdhani font-bold text-xs uppercase tracking-wider shadow-lg hover:border-[#66c0f4]/80 hover:shadow-[0_0_20px_rgba(102,192,244,0.25)] hover:-translate-y-0.5 transition-all duration-300"
      >
        <Plus className="w-4 h-4" />
        Add Steam Game
      </button>

      {showImport && (
        <SteamImport
          onAdd={(data, price, origPrice, badge) => {
            const entry = addGame(data, price, origPrice, badge);
            return entry;
          }}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
