export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold mb-4">StayEasy</h3>
            <p className="text-gray-400">
              Your perfect homestay experience awaits. Quality rooms, easy booking, unforgettable stays.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/rooms" className="hover:text-white">Rooms</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>123 Homestay Lane, Da Lat, Vietnam</li>
              <li>+84 123 456 789</li>
              <li>support@stayeasy.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} StayEasy Homestay Booking. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';