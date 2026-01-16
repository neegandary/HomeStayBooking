import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary/5 rounded-2xl p-8 mt-10 mx-4 mb-4 max-w-[1200px] lg:mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-4 text-primary mb-4">
            <div className="size-6">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg">StayEasy</h3>
          </div>
          <p className="text-primary/70 text-sm max-w-sm">
            Homestay hoàn hảo của bạn chỉ cách một cú nhấp chuột. Trải nghiệm sự thoải mái, chất lượng và những kỷ niệm khó quên với bộ sưu tập bất động sản được tuyển chọn của chúng tôi.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-primary">Liên kết nhanh</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/" className="text-primary/70 hover:text-action transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/rooms" className="text-primary/70 hover:text-action transition-colors">
                Phòng
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-primary/70 hover:text-action transition-colors">
                Giới thiệu
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="font-bold text-primary">Kết nối</h4>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-primary/70 hover:text-action transition-colors" aria-label="Facebook">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"></path>
              </svg>
            </a>
            <a href="#" className="text-primary/70 hover:text-action transition-colors" aria-label="Twitter">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.65.177-1.352.23-2.064.078.618 1.94 2.423 3.282 4.568 3.322-1.853 1.455-4.188 2.22-6.685 2.152-2.172-.032-4.21-.68-6.06-1.822 2.127 1.365 4.673 2.16 7.34 2.16 8.814 0 13.637-7.308 13.637-13.637 0-.207-.005-.414-.014-.62.936-.677 1.75-1.522 2.396-2.487z"></path>
              </svg>
            </a>
            <a href="#" className="text-primary/70 hover:text-action transition-colors" aria-label="Instagram">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary/10 mt-8 pt-6 text-center text-sm text-primary/60">
        <p>&copy; {new Date().getFullYear()} StayEasy. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
}
