import { DollarSign, Zap, ShieldCheck, BadgeCheck, Headphones, Crown } from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: 'Affordable Prices',
    description: 'Best prices in the market with regular discounts and flash sales on premium titles.',
  },
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Get your game keys delivered within minutes of purchase confirmation.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Transactions',
    description: '100% secure payment processing with encrypted UPI and wallet transactions.',
  },
  {
    icon: BadgeCheck,
    title: 'Trusted Seller',
    description: 'Join 1000+ happy gamers who trust Jhojha Games for their purchases.',
  },
  {
    icon: Headphones,
    title: 'Fast Support',
    description: '24/7 dedicated customer support via Telegram and Instagram for all queries.',
  },
  {
    icon: Crown,
    title: 'Premium Service',
    description: 'Every game is verified and tested before delivery to ensure top quality.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">
              Why Choose Us
            </span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
            <span className="text-white">WHY CHOOSE </span>
            <span className="text-yellow-500 gold-glow">JHOJHA GAMES</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-lg uppercase tracking-wider">
            Your trusted gaming partner
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/10 hover:border-yellow-500/40 transition-all duration-500 hover:-translate-y-2"
                style={{ animation: `fadeInUp 0.6s ease ${idx * 0.1}s both` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:to-transparent transition-all duration-500" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-5 group-hover:bg-yellow-500 group-hover:border-yellow-500 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(245,166,35,0.5)]">
                    <Icon className="w-7 h-7 text-yellow-500 group-hover:text-black transition-colors duration-500" />
                  </div>
                  <h3 className="font-rajdhani text-xl font-700 text-white mb-2 group-hover:text-yellow-500 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 font-inter text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
