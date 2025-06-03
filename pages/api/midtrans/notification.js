import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const notification = req.body;
    
    // Verify notification authenticity
    const statusResponse = await snap.transaction.notification(notification);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

    // Handle different transaction statuses
    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        // TODO: Set payment status in database to 'Challenge'
      } else if (fraudStatus == 'accept') {
        // TODO: Set payment status in database to 'Success'
      }
    } else if (transactionStatus == 'settlement') {
      // TODO: Set payment status in database to 'Success'
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      // TODO: Set payment status in database to 'Failure'
    } else if (transactionStatus == 'pending') {
      // TODO: Set payment status in database to 'Pending'
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Notification Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}