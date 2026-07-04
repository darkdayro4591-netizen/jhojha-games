import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I order?',
    answer: 'Simply browse our catalog, choose your game, and message us on Telegram (@JhojhaGames) or Instagram (@jhojha.games) with the game name. We will guide you through the payment process and deliver your game instantly.',
  },
  {
    question: 'How long is delivery?',
    answer: 'Most games are delivered instantly within 5-10 minutes of payment confirmation. During peak hours, delivery may take up to 30 minutes. Pre-order titles are delivered on their release date.',
  },
  {
    question: 'Are games safe?',
    answer: 'Yes, all games and keys we provide are 100% genuine and safe. We source our games from authorized distributors and every key is verified before delivery. We also offer a replacement guarantee if any issue arises.',
  },
  {
    question: 'Do you provide support?',
    answer: 'Absolutely! We provide 24/7 customer support via Telegram and Instagram. Whether you need help with installation, activation, or have any questions about your purchase, our team is always ready to assist you.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept UPI, Paytm, PhonePe, and Google Pay. All payments are processed securely and you will receive a confirmation message once payment is verified.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-yellow-500 text-xs font-rajdhani font-700 uppercase tracking-widest">
              Got Questions?
            </span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
            <span className="text-white">FREQUENTLY ASKED </span>
            <span className="text-yellow-500 gold-glow">QUESTIONS</span>
          </h2>
          <p className="text-gray-400 font-rajdhani text-lg uppercase tracking-wider">
            Everything you need to know
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item rounded-xl overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] transition-all duration-300 ${
                openIndex === idx ? 'border-yellow-500/40' : ''
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 lg:p-6 text-left"
              >
                <span className="font-rajdhani text-base lg:text-lg font-700 text-white pr-4">
                  {faq.question}
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    openIndex === idx
                      ? 'bg-yellow-500 text-black rotate-180'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-out ${
                  openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 lg:px-6 pb-5 lg:pb-6 text-gray-400 font-inter text-sm lg:text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-10">
          <p className="text-gray-400 font-inter mb-4">Still have questions?</p>
          <a
            href="https://t.me/JhojhaGames"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold inline-flex items-center gap-2 px-6 py-3 rounded-lg font-rajdhani text-sm font-700 uppercase tracking-widest"
          >
            Contact Us on Telegram
          </a>
        </div>
      </div>
    </section>
  );
}
