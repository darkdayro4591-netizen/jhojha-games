import { ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By using Jhojha Games, you agree to comply with these Terms & Conditions and all applicable laws.',
  },
  {
    title: '2. Products & Services',
    body: 'Jhojha Games provides digital gaming products and related services. Product availability, pricing, and offers may change without notice.',
  },
  {
    title: '3. Order Process',
    body: 'Customers must provide accurate information. Orders are processed after successful payment verification. Delivery times may vary depending on the product.',
  },
  {
    title: '4. Payments',
    body: 'Full payment must be completed before order processing. Customers must pay the exact amount displayed during checkout. Orders with incorrect payment amounts may be delayed or cancelled.',
  },
  {
    title: '5. Refund Policy',
    body: 'Due to the digital nature of products, all sales are generally final. Refunds may only be considered in cases of duplicate payments, failed delivery, or technical issues caused by Jhojha Games. Refund requests are reviewed individually.',
  },
  {
    title: '6. Customer Responsibilities',
    body: 'Customers agree to provide accurate information, keep account credentials secure, use purchased products responsibly, and follow all applicable laws and platform rules.',
  },
  {
    title: '7. Prohibited Activities',
    body: 'Users may not attempt unauthorized access to the website, abuse payment systems, submit false information, distribute malware or harmful content, or interfere with website operations.',
  },
  {
    title: '8. Account Security',
    body: 'Customers are responsible for maintaining the security of their accounts and passwords.',
  },
  {
    title: '9. Intellectual Property',
    body: 'All website content, branding, logos, graphics, and design elements belong to Jhojha Games or their respective owners.',
  },
  {
    title: '10. Limitation of Liability',
    body: 'Jhojha Games shall not be liable for indirect damages, loss of profits, service interruptions, or third-party platform issues.',
  },
  {
    title: '11. Third-Party Services',
    body: 'The website may use third-party services such as payment providers, hosting providers, and communication platforms.',
  },
  {
    title: '12. Order Cancellation',
    body: 'Jhojha Games reserves the right to refuse or cancel orders that violate these Terms & Conditions, contain incorrect information, show suspicious activity, or involve payment verification issues.',
  },
  {
    title: '13. Modifications',
    body: 'We reserve the right to update these Terms & Conditions at any time. Updated terms become effective upon publication.',
  },
  {
    title: '14. Governing Law',
    body: 'These Terms & Conditions shall be governed by the applicable laws of the jurisdiction in which Jhojha Games operates.',
  },
  {
    title: '15. Contact',
    body: 'For questions regarding these Terms & Conditions, contact Instagram @jhojha.games or Telegram @JhojhaGames.',
  },
];

export default function TermsAndConditions() {
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
            <h1 className="text-3xl font-black sm:text-4xl">Terms & Conditions</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
              Last Updated: 04 July 2026. Welcome to Jhojha Games. By accessing or using this website, you agree to the following Terms & Conditions.
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
                By using Jhojha Games, you acknowledge that you have read and understood these Terms & Conditions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
