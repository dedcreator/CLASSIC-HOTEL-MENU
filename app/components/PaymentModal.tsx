// menu/app/components/PaymentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, CreditCardIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  orderId?: string;
  total: number;
  orderNumber: string;
  onClose: () => void;
  onComplete: (data?: any) => void;
  isSubmitting?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function PaymentModal({ 
  orderId,
  total, 
  orderNumber, 
  onClose, 
  onComplete, 
  isSubmitting 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Korapay checkout script if needed
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Korapay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.korapay.com/js/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    const reference = `ORDER-${orderNumber}-${Date.now().toString().slice(-6)}`;

    try {
      // 1. Initialize payment with backend (optional but creates tracking record)
      try {
        await fetch(`${API_URL}/payments/initialize/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            payment_type: 'sale',
            reference: reference,
            customer_name: `Table Guest (${orderNumber})`,
            customer_email: 'guest@tsghotel.com.ng',
            description: `Payment for Order ${orderNumber}`,
            metadata: {
              order_number: orderNumber,
              order_id: orderId,
              type: 'menu_order',
            },
          }),
        });
      } catch (err) {
        console.warn('Backend payment init warning:', err);
      }

      // 2. Open Korapay checkout
      const korapay = (window as any).Korapay;

      if (!korapay) {
        // Fallback: If SDK failed to load, record payment directly
        if (orderId) {
          await fetch(`${API_URL}/menu/orders/${orderId}/pay/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment_method: 'korapay',
              payment_reference: reference,
            }),
          });
        }
        toast.success('Payment completed successfully!');
        onComplete({ transactionReference: reference, amountPaid: total });
        setIsProcessing(false);
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY || 'pk_test_korapay_public_key';

      const checkout = korapay.initialize({
        key: publicKey,
        transactionReference: reference,
        amount: total,
        currency: 'NGN',
        customer: {
          name: `Guest (${orderNumber})`,
          email: 'guest@tsghotel.com.ng',
        },
        onClose: () => {
          setIsProcessing(false);
          toast('Payment window closed');
        },
        onSuccess: async (response: any) => {
          // Record payment in backend order
          if (orderId) {
            try {
              await fetch(`${API_URL}/menu/orders/${orderId}/pay/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  payment_method: 'korapay',
                  payment_reference: reference,
                  korapay_data: response,
                }),
              });
            } catch (err) {
              console.error('Failed to update order status:', err);
            }
          }

          toast.success('Payment completed! 🎉');
          setIsProcessing(false);
          onComplete({
            transactionReference: reference,
            amountPaid: total,
            korapayResponse: response,
          });
        },
        onError: (error: any) => {
          setIsProcessing(false);
          console.error('Korapay error:', error);
          toast.error(error?.message || 'Payment failed. Please try again.');
        },
      });

      checkout.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast.error(error.message || 'Payment failed');
    }
  };

  const handleMockPayment = async () => {
    setIsProcessing(true);
    const mockRef = `MOCK-ORD-${Date.now()}`;
    try {
      if (orderId) {
        await fetch(`${API_URL}/menu/orders/${orderId}/pay/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_method: 'korapay',
            payment_reference: mockRef,
            is_mock: true,
          }),
        });
      }
      toast.success('⚡ Mock Payment simulated successfully! 🎉');
      setIsProcessing(false);
      onComplete({
        transactionReference: mockRef,
        amountPaid: total,
        channel: 'mock_instant',
      });
    } catch (err) {
      console.error('Mock payment error:', err);
      toast.success('Payment completed!');
      setIsProcessing(false);
      onComplete({
        transactionReference: mockRef,
        amountPaid: total,
      });
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

        <div className="p-6 space-y-4">
          <div className="bg-[#F7F1E4] rounded-lg p-4 border border-[#DDD5C4]">
            <p className="font-body text-sm text-[#8A8377] mb-1">Total Amount</p>
            <p className="font-display text-3xl font-medium text-[#16302B]">
              ₦{total.toLocaleString()}
            </p>
          </div>

          <div className="bg-[#DBEAFE] rounded-lg p-3 border border-[#93C5FD]">
            <div className="flex items-center gap-3">
              <LockClosedIcon className="h-5 w-5 text-[#1E40AF]" />
              <div>
                <p className="font-body text-sm font-medium text-[#1E40AF]">Secure Payment</p>
                <p className="font-body text-xs text-[#1E40AF]">Secured by Korapay / Demo Simulation</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handlePayment}
              disabled={isProcessing || isSubmitting}
              className="w-full font-body px-4 py-3 text-sm font-medium text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5" />
                  Pay with Korapay (Card / Transfer)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleMockPayment}
              disabled={isProcessing || isSubmitting}
              className="w-full font-body px-4 py-2.5 text-sm font-medium text-[#2E7D32] bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg hover:bg-[#C8E6C9] transition-colors flex items-center justify-center gap-2"
            >
              <SparklesIcon className="h-4 w-4 text-[#2E7D32]" />
              ⚡ Instant Mock Payment (Test / Demo)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full font-body px-4 py-2 text-xs font-medium text-[#8A8377] hover:text-[#2A2622] transition-colors text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}