// menu/app/components/PaymentModal.tsx
'use client';

import { useState } from 'react';
import { XMarkIcon, CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  total: number;
  orderNumber: string;
  onClose: () => void;
  onComplete: (data: any) => void;
  isSubmitting: boolean;
}

export default function PaymentModal({ 
  total, 
  orderNumber, 
  onClose, 
  onComplete, 
  isSubmitting 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Initialize Korapay payment
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'NGN',
          customer: {
            name: 'Guest',
            email: 'guest@hotel.com',
          },
          reference: `ORDER-${orderNumber}`,
          metadata: {
            order_number: orderNumber,
            type: 'menu_order',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment initialization failed');
      }

      // Initialize Korapay checkout
      const korapay = (window as any).Korapay;

      if (!korapay) {
        throw new Error('Korapay SDK not loaded');
      }

      const checkout = korapay.initialize({
        key: process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY,
        transactionReference: data.reference,
        amount: total,
        currency: 'NGN',
        customer: {
          name: 'Guest',
          email: 'guest@hotel.com',
        },
        onClose: () => {
          setIsProcessing(false);
          toast.info('Payment cancelled');
        },
        onSuccess: async (response: any) => {
          onComplete({
            transactionReference: data.reference,
            amountPaid: total,
            korapayResponse: response,
          });
          toast.success('Payment completed!');
          setIsProcessing(false);
        },
        onError: (error: any) => {
          setIsProcessing(false);
          toast.error(error.message || 'Payment failed');
        },
      });

      checkout.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast.error(error.message || 'Payment failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        <div className="p-4 border-b border-[#DDD5C4] flex justify-between items-center bg-[#16302B] text-[#F7F1E4] rounded-t-xl">
          <div>
            <h2 className="font-display text-lg font-medium">Pay for Order</h2>
            <p className="font-body text-sm text-[#B9C4B9]">{orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#1D3B34] rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-[#F7F1E4] rounded-lg p-4 border border-[#DDD5C4]">
            <p className="font-body text-sm text-[#8A8377] mb-1">Total Amount</p>
            <p className="font-display text-3xl font-medium text-[#16302B]">
              ₦{total.toLocaleString()}
            </p>
          </div>

          <div className="bg-[#DBEAFE] rounded-lg p-4 border border-[#93C5FD]">
            <div className="flex items-center gap-3">
              <LockClosedIcon className="h-5 w-5 text-[#1E40AF]" />
              <div>
                <p className="font-body text-sm font-medium text-[#1E40AF]">Secure Payment</p>
                <p className="font-body text-xs text-[#1E40AF]">Secured by Korapay</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || isSubmitting}
              className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5" />
                  Pay Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}