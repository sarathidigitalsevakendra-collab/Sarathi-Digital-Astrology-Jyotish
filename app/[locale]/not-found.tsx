import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cosmic-blue to-gray-900 px-4">
      <div className="mx-auto max-w-md text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-4 shadow-lg">
            <svg
              className="h-16 w-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="mb-3 text-6xl font-bold text-white">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-orange-200">Page Not Found</h2>
        <p className="mb-8 text-slate-300">
          The cosmic path you&apos;re seeking doesn&apos;t exist in our constellation. Perhaps the
          stars have guided you elsewhere?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Return Home
          </Link>

          <Link
            href="/consultations"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Browse Astrologers
          </Link>
        </div>

        {/* Help Links */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="mb-3 text-sm font-semibold text-orange-200">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-300 hover:text-white">
              Dashboard
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/shop" className="text-slate-300 hover:text-white">
              Marketplace
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/faq" className="text-slate-300 hover:text-white">
              FAQ
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/contact" className="text-slate-300 hover:text-white">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
