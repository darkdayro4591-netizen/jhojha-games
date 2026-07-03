import { useEffect, useState, useRef } from 'react';
import { Users, Gamepad2, Smile } from 'lucide-react';

const stats = [
  { icon: Users, value: 1000, suffix: '+', label: 'Happy Customers' },
  { icon: Gamepad2, value: 5000, suffix: '+', label: 'Games Delivered' },
  { icon: Smile, value: 99, suffix: '%', label: 'Customer Satisfaction' },
];

export default function Stats() {
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    stats.forEach((stat, i) => {
      let current = 0;
      const increment = stat.value / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        setCounts(prev => {
          const next = [...prev];
          next[i] = Math.floor(current);
          return next;
        });
      }, interval);
    });
  }, [visible]);

  return (
    <section ref={ref} className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="stat-card group p-8 rounded-2xl text-center hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4 group-hover:bg-yellow-500/20 transition-all duration-500">
                  <Icon className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="font-orbitron text-4xl sm:text-5xl font-black text-yellow-500 gold-glow mb-2">
                  {counts[i].toLocaleString()}{stat.suffix}
                </div>
                <div className="font-rajdhani text-sm sm:text-base font-600 uppercase tracking-widest text-gray-300">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
