import apiClient from './api/client';
import toast from 'react-hot-toast';

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface PaymentOptions {
  orderType: 'grocery' | 'food' | 'service';
  dbOrderId: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

export const processPayment = async (options: PaymentOptions) => {
  const { orderType, dbOrderId, onSuccess, onFailure } = options;

  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    toast.error('Failed to load payment gateway. Please try again.');
    onFailure?.(new Error('Failed to load Razorpay script'));
    return;
  }

  try {
    const { data } = await apiClient.post('/payment/create-order', {
      orderType,
      dbOrderId,
    });

    const { razorpayOrderId, amount, currency, keyId } = data;

    const rzpOptions = {
      key: keyId,
      amount,
      currency,
      name: 'Caretaker Platform',
      description: `Payment for ${orderType} ${dbOrderId}`,
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        const verifyToast = toast.loading('Verifying payment...');
        try {
          await apiClient.post('/payment/verify', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            dbOrderId,
            orderType,
          });
          toast.dismiss(verifyToast);
          toast.success('Payment successful!');
          onSuccess(response.razorpay_payment_id);
        } catch (err: any) {
          toast.dismiss(verifyToast);
          const errMsg = err?.response?.data?.message || 'Payment verification failed';
          toast.error(errMsg);
          onFailure?.(new Error(errMsg));
        }
      },
      modal: {
        ondismiss: function () {
          toast.error('Payment cancelled');
          onFailure?.(new Error('Payment cancelled by user'));
        },
      },
      prefill: {
        name: '',
        email: '',
      },
      theme: {
        color: '#3B82F6',
      },
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.open();
  } catch (err: any) {
    const errMsg = err?.response?.data?.message || 'Failed to initiate payment';
    toast.error(errMsg);
    onFailure?.(new Error(errMsg));
  }
};
