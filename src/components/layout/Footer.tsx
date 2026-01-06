export default function Footer() {
  return (
    <footer className="bg-primary text-white py-16 border-t border-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6 group">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary font-black text-lg transition-transform group-hover:scale-105">S</div>
              <span className="text-xl font-black tracking-tighter text-white">StayEasy</span>
            </div>
            <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xs mx-auto md:mx-0">
              Your perfect homestay experience awaits. Quality rooms, easy booking, unforgettable stays.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/" className="text-white/60 hover:text-action transition-colors">Home</Link></li>
              <li><Link href="/rooms" className="text-white/60 hover:text-action transition-colors">Rooms</Link></li>
              <li><Link href="/about" className="text-white/60 hover:text-action transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-white/60 hover:text-action transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li className="text-white/60 flex items-center justify-center md:justify-start gap-3">
                <span className="text-accent">•</span> 123 Homestay Lane, Da Lat
              </li>
              <li className="text-white/60 flex items-center justify-center md:justify-start gap-3">
                <span className="text-accent">•</span> +84 123 456 789
              </li>
              <li className="text-white/60 flex items-center justify-center md:justify-start gap-3">
                <span className="text-accent">•</span> support@stayeasy.com
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-16 pt-8 text-center text-white/30 text-[10px] font-black uppercase tracking-widest">
          &copy; {new Date().getFullYear()} StayEasy Homestay Booking. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';