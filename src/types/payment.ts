export interface SePayTransaction {
  id: number;
  gateway: string;
  transaction_date: string;
  account_number: string;
  sub_account: string | null;
  amount_in: number;
  amount_out: number;
  accumulated_balance: number;
  code: string | null;
  content: string;
  reference_number: string;
  body: string | null;
}

export interface SePayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  transferType: 'in' | 'out';
  transferAmount: number;
  accumulatedBalance: number;
  code: string | null;
  content: string;
  referenceCode: string;
  description: string;
}

export interface PaymentInfo {
  bookingId: string;
  amount: number;
  description: string;
  qrUrl: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}
