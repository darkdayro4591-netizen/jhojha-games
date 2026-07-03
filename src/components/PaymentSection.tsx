import { Smartphone, Wallet, CreditCard, ShieldCheck } from 'lucide-react';

const methods = [
  { name: 'UPI', icon: Smartphone, color: 'from-orange-500 to-orange-600' },
  { name: 'Paytm', icon: Wallet, color: 'from-blue-500 to-blue-600' },
  { name: 'PhonePe', icon: CreditCard, color: 'from-purple-500 to-purple-600' },
  { name: 'Google Pay', icon: Smartphone, color: 'from-green-500 to-green-600' },
];

export default function PaymentSection() {
  return (
    <section id="payment" className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 hex-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">Secure Payments</span>
          </div>
          <h2 className="font-orbitron text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
            <span className="text-white">PAYMENT </span><span className="text-yellow-500 gold-glow">METHODS</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-base sm:text-lg uppercase tracking-wider">We accept all major payment methods</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {methods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <div key={idx} className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border border-yellow-500/10 hover:border-yellow-500/40 transition-all duration-500 hover:-translate-y-2 gold-hover-card flex flex-col items-center text-center" style={{ animation: `fadeInUp 0.5s ease ${idx * 0.1}s both` }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-rajdhani text-base sm:text-lg font-700 text-white group-hover:text-yellow-500 transition-colors duration-300">{method.name}</h3>
                <p className="text-gray-500 font-inter text-xs mt-1">Secure & Fast</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/30">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span className="font-rajdhani text-sm font-600 text-green-400 uppercase tracking-wider">100% Secure Transactions</span>
          </div>
        </div>
      </div>
    </section>
  );
}
