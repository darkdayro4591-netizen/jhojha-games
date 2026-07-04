interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; escape?: boolean; backdropclose?: boolean };
  handler?: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  config?: {
    display?: {
      blocks?: Record<string, { name: string; instruments: { method: string; flows?: string[] }[] }>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

export {};
