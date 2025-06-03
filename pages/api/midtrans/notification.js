import midtransClient from 'midtrans-client';

export const config = {
  api: {
    bodyParser: true, // pastikan JSON body bisa diparse
  },
};

export default async function handler(req, res) {
  // GET untuk testing endpoint
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Notification endpoint is working',
      timestamp: new Date().toISOString(),
      endpoint: '/api/midtrans/notification',
      methods: ['GET', 'POST']
    });
  }

  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Inisialisasi Snap di dalam handler
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    const notification = req.body;

    // Logging untuk debug
    console.log('Received notification:', notification);

    // Proses notifikasi dari Midtrans
    const statusResponse = await snap.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

    // Handle status (bisa update database di sini)
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        console.log('Payment status: Challenge');
      } else if (fraudStatus === 'accept') {
        console.log('Payment status: Success (Capture Accept)');
      }
    } else if (transactionStatus === 'settlement') {
      console.log('Payment status: Success (Settlement)');
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      console.log('Payment status: Failed');
    } else if (transactionStatus === 'pending') {
      console.log('Payment status: Pending');
    }

    // Penting: selalu return 200 ke Midtrans
    return res.status(200).json({ 
      success: true,
      message: 'Notification processed successfully' 
    });

  } catch (error) {
    console.error('Notification Error:', error);
    return res.status(200).json({ // Tetap return 200 agar Midtrans tidak retry terus
      success: false,
      error: error.message
    });
  }
}