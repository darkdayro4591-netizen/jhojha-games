import { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

function getTimeLeft() {
  const now = new Date();
  const target = new Date();
  target.setHours(23, 59, 59, 999);
  const diff = target.getTime() - now.getTime();
  return {
    hours: Math.max(0, Math.floor(diff / (1000 * 60 * 60))),
    minutes: Math.max(0, Math.floor((diff / (1000 * 60)) % 60)),
    seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
  };
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <section id="deals" className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <Clock className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">Limited Time</span>
          </div>
          <h2 className="font-orbitron text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
            <span className="text-white">WEEKLY </span><span className="text-yellow-500 gold-glow">DEALS</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-base sm:text-lg uppercase tracking-wider">Hurry up! Sale ends in</p>
        </div>

        {/* Countdown */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-8">
          {units.map((unit, idx) => (
            <div key={idx} className="text-center">
              <div className="countdown-digit w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/30 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(245,166,35,0.1)]">
                <span className="font-orbitron text-2xl sm:text-3xl lg:text-4xl font-black text-yellow-500">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-gray-400 font-rajdhani text-xs sm:text-sm uppercase tracking-widest">{unit.label}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-yellow-500/10 border border-yellow-500/30">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-rajdhani text-sm sm:text-base font-600 text-yellow-500 uppercase tracking-wider">
              Up to 78% off on selected titles
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
