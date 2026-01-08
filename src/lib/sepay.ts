import { PaymentInfo } from '@/types/payment';

const BANK_ID = 'VCB'; // Vietcombank
const ACCOUNT_NUMBER = '1033569778';
const ACCOUNT_NAME = 'NGUYEN VAN MINH NHAT';

export const sepay = {
  generateQrUrl: (amount: number, description: string): string => {
    // VietQR Format using SePay template
    return `https://qr.sepay.vn/img?acc=${ACCOUNT_NUMBER}&bank=${BANK_ID}&amount=${amount}&des=${encodeURIComponent(description)}`;
  },

  getPaymentInfo: (bookingId: string, amount: number): PaymentInfo => {
    const description = `BK${bookingId}`;
    return {
      bookingId,
      amount,
      description,
      qrUrl: sepay.generateQrUrl(amount, description),
      accountName: ACCOUNT_NAME,
      accountNumber: ACCOUNT_NUMBER,
      bankName: BANK_ID,
    };
  },

  parseBookingId: (content: string): string | null => {
    // Match BK + alphanumeric ID (usually b + random string in our mock)
    const match = content.match(/BK(b[a-z0-9]+)/i);
    return match ? match[1] : null;
  }
};
