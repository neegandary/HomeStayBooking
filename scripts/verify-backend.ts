import { sepay } from '../src/lib/sepay';
import { storage } from '../src/lib/storage';

async function test() {
  console.log('--- Testing SePay Integration ---');

  // 1. Test QR Generation
  const amount = 1500000;
  const bookingId = 'bTest123';
  const info = sepay.getPaymentInfo(bookingId, amount);
  console.log('Payment Info:', info);

  if (info.description === 'BKbTest123' && info.qrUrl.includes('BKbTest123')) {
    console.log('✓ QR Generation passed');
  } else {
    console.error('✗ QR Generation failed');
  }

  // 2. Test Storage & Persistence
  storage.init();
  const testBooking: any = {
    id: bookingId,
    roomId: '1',
    userId: 'uTest',
    checkIn: '2026-01-10',
    checkOut: '2026-01-15',
    guests: 2,
    totalPrice: amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  storage.saveBooking(testBooking);
  let bookings = storage.getBookings();
  let found = bookings.find(b => b.id === bookingId);

  if (found && found.status === 'pending') {
    console.log('✓ Storage Save passed');
  } else {
    console.error('✗ Storage Save failed');
  }

  // 3. Test Webhook Logic (Parsing & Updating)
  const webhookContent = 'Chuyen khoan BKbTest123 thanh toan phong';
  const parsedId = sepay.parseBookingId(webhookContent);
  console.log('Parsed Booking ID:', parsedId);

  if (parsedId === bookingId) {
    console.log('✓ Webhook ID Parsing passed');

    storage.updateBookingStatus(parsedId, 'confirmed');
    bookings = storage.getBookings();
    found = bookings.find(b => b.id === bookingId);

    if (found && found.status === 'confirmed') {
      console.log('✓ Webhook Status Update passed');
    } else {
      console.error('✗ Webhook Status Update failed');
    }
  } else {
    console.error('✗ Webhook ID Parsing failed');
  }

  console.log('--- Test Finished ---');
}

test().catch(console.error);
