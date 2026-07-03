import { useState, useEffect, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  name: string;
  game: string;
  rating: number;
  text: string;
  avatar: string;
}

const reviews: Review[] = [
  {
    name: 'Rahul Sharma',
    game: 'GTA VI Pre-Order',
    rating: 5,
    text: 'Got my GTA VI pre-order instantly! Best prices and super fast delivery. Jhojha Games is my go-to store for all PC games now.',
    avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Priya Patel',
    game: 'The Last of Us Part I',
    rating: 5,
    text: 'Amazing service! The game key worked perfectly and delivery was instant. Customer support on Telegram was very helpful.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Arjun Kumar',
    game: 'Resident Evil Collection',
    rating: 5,
    text: 'Incredible deal on the RE collection! Saved so much compared to other stores. Highly recommend Jhojha Games to every gamer.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Sneha Reddy',
    game: 'Forza Horizon Series',
    rating: 5,
    text: 'Bought the Forza Horizon bundle and got both games at an unbeatable price. Instant delivery and great support. 10/10!',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Vikram Singh',
    game: "Assassin's Creed Black Flag",
    rating: 5,
    text: 'Trusted seller with genuine keys. Been buying from Jhojha Games for months and never had an issue. Best in the business!',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

export default function Reviews() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % reviews.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + reviews.length) % reviews.length), []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  return (
    <section id="reviews" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 hex-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">
              Testimonials
            </span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
            <span className="text-white">CUSTOMER </span>
            <span className="text-yellow-500 gold-glow">REVIEWS</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-lg uppercase tracking-wider">
            What our gamers say about us
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {reviews.map((review, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-2">
                  <div className="review-card rounded-2xl p-8 lg:p-10 relative">
                    <Quote className="absolute top-6 right-6 w-12 h-12 text-yellow-500/10" />

                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500/40"
                      />
                      <div>
                        <h4 className="font-rajdhani text-lg font-700 text-white">{review.name}</h4>
                        <p className="text-sm text-yellow-500/70 font-inter">Purchased: {review.game}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? 'star-filled fill-yellow-500' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-300 font-inter text-base lg:text-lg leading-relaxed">
                      "{review.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={prev}
              className="p-3 rounded-full bg-white/5 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    current === idx
                      ? 'w-8 bg-yellow-500 shadow-[0_0_8px_rgba(245,166,35,0.8)]'
                      : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-3 rounded-full bg-white/5 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
