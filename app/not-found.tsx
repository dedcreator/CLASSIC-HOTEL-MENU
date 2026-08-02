// menu/app/not-found.tsx
import Link from 'next/link';
import { HomeIcon, QrCodeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#DDD5C4] p-8 max-w-md w-full text-center shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-[#F7F1E4] rounded-full flex items-center justify-center">
            <QrCodeIcon className="h-12 w-12 text-[#8A8377]" />
          </div>
        </div>
        
        <h1 className="font-display text-4xl font-medium text-[#2A2622] mb-2">404</h1>
        <h2 className="font-display text-2xl font-medium text-[#2A2622] mb-4">Table Not Found</h2>
        
        <p className="font-body text-[#8A8377] mb-6">
          The table you're looking for doesn't exist or has been removed.
          Please scan a valid QR code to access the menu.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="font-body inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#16302B] text-[#F7F1E4] rounded-xl hover:bg-[#1D3B34] transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            Back to Home
          </Link>
          
          <p className="font-body text-xs text-[#8A8377]">
            If you believe this is an error, please contact the restaurant staff.
          </p>
        </div>
      </div>
    </div>
  );
}