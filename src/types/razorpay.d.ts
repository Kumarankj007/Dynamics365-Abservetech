interface RazorpayOptions {
  key?: string;
  amount?: number | string;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id?: string;
  handler?: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  method?: {
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    upi?: boolean;
    emi?: boolean;
    paylater?: boolean;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: () => void): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
