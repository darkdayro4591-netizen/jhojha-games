import { useState, useEffect } from 'react';
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
import SearchModal from './components/SearchModal';
import AdminDashboard from './pages/AdminDashboard';
import FloatingSupportButton from './components/FloatingSupportButton';

const isAdminPath = window.location.pathname === '/admin';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (isAdminPath) return <AdminDashboard />;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar onSearchOpen={() => setShowSearch(true)} />
      <main>
        <Hero />
        <CountdownTimer />
        <FeaturedDeals />
        <GameCategories onSelectCategory={(c) => { setSelectedCategory(c); setShowSearch(false); }} />
        <FeaturedGames searchQuery="" externalCategory={selectedCategory} />
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

      {showSearch && (
        <SearchModal onClose={() => setShowSearch(false)} />
      )}

      <FloatingSupportButton />
    </div>
  );
}
