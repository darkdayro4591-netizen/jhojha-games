import { MousePointerClick, MessageSquare, CreditCard, Gamepad2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MousePointerClick,
    title: 'Choose Game',
    description: 'Browse our catalog and select the game you want to purchase.',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Contact Us',
    description: 'Message us on Telegram or Instagram with your game choice.',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Make Payment',
    description: 'Pay securely via UPI, Paytm, PhonePe, or Google Pay.',
  },
  {
    number: '04',
    icon: Gamepad2,
    title: 'Receive Game',
    description: 'Get your game key or account delivered instantly on Telegram.',
  },
];

export default function OrderProcess() {
  return (
    <section id="order-process" className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">How It Works</span>
          </div>
          <h2 className="font-orbitron text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
            <span className="text-white">ORDER </span><span className="text-yellow-500 gold-glow">PROCESS</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-base sm:text-lg uppercase tracking-wider">Get your game in 4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="group relative" style={{ animation: `fadeInUp 0.6s ease ${idx * 0.15}s both` }}>
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-yellow-500/30 to-transparent -translate-x-1/2 z-0" />
                )}

                <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/10 hover:border-yellow-500/40 transition-all duration-500 hover:-translate-y-2 gold-hover-card">
                  {/* Step number */}
                  <div className="absolute top-4 right-4 font-orbitron text-3xl font-black text-yellow-500/10 group-hover:text-yellow-500/20 transition-colors duration-500">
                    {step.number}
                  </div>

                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-4 group-hover:bg-yellow-500 group-hover:border-yellow-500 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(245,166,35,0.5)]">
                      <Icon className="w-7 h-7 text-yellow-500 group-hover:text-black transition-colors duration-500" />
                    </div>
                    <h3 className="font-rajdhani text-lg font-700 text-white mb-2 group-hover:text-yellow-500 transition-colors duration-300">{step.title}</h3>
                    <p className="text-gray-400 font-inter text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
