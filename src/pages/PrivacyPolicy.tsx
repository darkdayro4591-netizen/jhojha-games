import { ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We may collect your name, email address, username, Instagram username, Telegram username, order information, payment information, and support messages.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to process orders, deliver purchased products, provide customer support, verify transactions, improve our services, and prevent fraud and abuse.',
  },
  {
    title: '3. Payment Information',
    body: 'Jhojha Games does not store full payment card details. Payments are processed through supported payment methods, and transaction details may be used for order verification and support purposes.',
  },
  {
    title: '4. Account Security',
    body: 'Customers are responsible for keeping their login credentials secure. Passwords are stored using secure encryption and are never displayed publicly.',
  },
  {
    title: '5. Customer Data Protection',
    body: 'We do not sell customer information. Customer data is only used for store operations and support services.',
  },
  {
    title: '6. Order Information',
    body: 'Customers can only view their own orders and account information. Access to order history and account details requires authentication.',
  },
  {
    title: '7. Cookies',
    body: 'Our website may use cookies and similar technologies to improve user experience and website performance.',
  },
  {
    title: '8. Third-Party Services',
    body: 'We may use third-party services such as payment providers, hosting providers, and analytics services. These services may process information according to their own privacy policies.',
  },
  {
    title: '9. Data Retention',
    body: 'We retain information only as long as necessary for order fulfillment, customer support, and legal or security requirements.',
  },
  {
    title: '10. Security',
    body: 'We implement reasonable security measures to protect customer information from unauthorized access, misuse, or disclosure.',
  },
  {
    title: '11. Children\'s Privacy',
    body: 'Our services are not directed toward children under the age required by applicable law.',
  },
  {
    title: '12. Changes to This Policy',
    body: 'We may update this Privacy Policy at any time. Changes become effective when posted on the website.',
  },
  {
    title: '13. Contact Us',
    body: 'For privacy-related questions, contact Instagram @jhojha.games or Telegram @JhojhaGames.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        <a
          href="/"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-yellow-500/30 bg-white/5 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:border-yellow-500/60 hover:bg-yellow-500/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </a>

        <div className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-b from-[#111111] to-[#050505] shadow-[0_0_40px_rgba(245,166,35,0.12)]">
          <div className="border-b border-yellow-500/20 bg-yellow-500/10 px-6 py-8 sm:px-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">Legal</p>
            <h1 className="text-3xl font-black sm:text-4xl">Privacy Policy</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
              Last Updated: 04 July 2026. Welcome to Jhojha Games. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website.
            </p>
          </div>

          <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-2 text-lg font-semibold text-yellow-400">{section.title}</h2>
                <p className="text-sm leading-7 text-gray-300 sm:text-base">{section.body}</p>
              </section>
            ))}

            <section className="rounded-2xl border border-yellow-500/20 bg-black/40 p-5">
              <p className="text-sm leading-7 text-gray-300 sm:text-base">
                By using Jhojha Games, you agree to this Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
