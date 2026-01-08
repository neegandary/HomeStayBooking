import crypto from 'crypto';
import { format } from 'date-fns';

// VNPay Sandbox Configuration
const VNPAY_CONFIG = {
  vnp_TmnCode: 'CGXZLS0Z', // Sandbox TMN Code
  vnp_HashSecret: 'XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN', // Sandbox Hash Secret
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/vnpay`
    : 'http://localhost:3000/api/webhooks/vnpay',
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_CurrCode: 'VND',
  vnp_Locale: 'vn',
};

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

export const vnpay = {
  /**
   * Create VNPay payment URL
   */
  createPaymentUrl: (params: {
    bookingId: string;
    amount: number;
    orderInfo: string;
    ipAddr: string;
  }): string => {
    const { bookingId, amount, orderInfo, ipAddr } = params;

    const createDate = format(new Date(), 'yyyyMMddHHmmss');
    const orderId = `${bookingId}_${createDate}`;

    let vnp_Params: Record<string, string> = {
      vnp_Version: VNPAY_CONFIG.vnp_Version,
      vnp_Command: VNPAY_CONFIG.vnp_Command,
      vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
      vnp_Locale: VNPAY_CONFIG.vnp_Locale,
      vnp_CurrCode: VNPAY_CONFIG.vnp_CurrCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: String(amount * 100), // VNPay requires amount * 100
      vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${new URLSearchParams(vnp_Params).toString()}`;
    return paymentUrl;
  },

  /**
   * Verify VNPay return/IPN signature
   */
  verifyReturnUrl: (vnpParams: Record<string, string>): boolean => {
    const secureHash = vnpParams['vnp_SecureHash'];
    
    // Remove hash params for verification
    const params = { ...vnpParams };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = sortObject(params);
    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
  },

  /**
   * Parse booking ID from VNPay TxnRef
   */
  parseBookingId: (txnRef: string): string | null => {
    // TxnRef format: bookingId_timestamp
    const parts = txnRef.split('_');
    return parts.length > 0 ? parts[0] : null;
  },

  /**
   * Check if payment is successful
   */
  isSuccessful: (responseCode: string): boolean => {
    return responseCode === '00';
  },
};

export default vnpay;
