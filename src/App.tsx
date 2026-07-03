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

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

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
    </div>
  );
}
