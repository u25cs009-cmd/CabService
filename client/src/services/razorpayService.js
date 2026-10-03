const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Dynamically load Razorpay Checkout script if not already present
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiate Razorpay payment flow for a booking
 */
export async function initiateRazorpayPayment({ referenceCode, paymentOption }) {
  // 1. Request server to create Razorpay Order (Server computes authoritative amount)
  const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referenceCode, paymentOption })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create Razorpay payment order');
  }

  const { orderId, amount, amountInPaise, currency, keyId, customerName, email, phone, isMockOrder } = json.data;

  // Load Razorpay script
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded && !isMockOrder) {
    throw new Error('Razorpay SDK script failed to load. Please check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    // Handling mock/test fallback when window.Razorpay or sample keys are active
    if (isMockOrder || !window.Razorpay || keyId.startsWith('rzp_test_sample')) {
      // Simulate Razorpay test popup dialog for test mode
      const mockPaymentId = `pay_mock_${Date.now()}`;
      const mockSignature = 'mock_test_signature';

      setTimeout(async () => {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referenceCode,
              razorpay_order_id: orderId,
              razorpay_payment_id: mockPaymentId,
              razorpay_signature: mockSignature
            })
          });
          const verifyJson = await verifyRes.json();
          if (verifyRes.ok && verifyJson.success) {
            resolve(verifyJson);
          } else {
            reject(new Error(verifyJson.message || 'Payment signature verification failed'));
          }
        } catch (err) {
          reject(err);
        }
      }, 800);
      return;
    }

    const options = {
      key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: currency || 'INR',
      name: 'Pi-Pip-Pip Cab Service',
      description: `Cab Ride Payment #${referenceCode} (${paymentOption.toUpperCase()})`,
      order_id: orderId,
      prefill: {
        name: customerName,
        email: email || '',
        contact: phone
      },
      theme: {
        color: '#f59e0b'
      },
      handler: async function (response) {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referenceCode,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyJson = await verifyRes.json();
          if (verifyRes.ok && verifyJson.success) {
            resolve(verifyJson);
          } else {
            reject(new Error(verifyJson.message || 'Payment signature verification failed'));
          }
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment window closed by user'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      reject(new Error(resp.error?.description || 'Razorpay payment failed'));
    });
    rzp.open();
  });
}
