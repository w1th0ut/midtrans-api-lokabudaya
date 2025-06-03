import midtransClient from 'midtrans-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    const notification = req.body;
    
    const statusResponse = await snap.transaction.notification(notification);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

    // Handle different transaction statuses
    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        console.log('Payment status: Challenge');
        // TODO: Set payment status in database to 'Challenge'
      } else if (fraudStatus == 'accept') {
        console.log('Payment status: Success (Capture Accept)');
        // TODO: Set payment status in database to 'Success'
      }
    } else if (transactionStatus == 'settlement') {
      console.log('Payment status: Success (Settlement)');
      // TODO: Set payment status in database to 'Success'
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      console.log('Payment status: Failed');
      // TODO: Set payment status in database to 'Failure'
    } else if (transactionStatus == 'pending') {
      console.log('Payment status: Pending');
      // TODO: Set payment status in database to 'Pending'
    }

    res.status(200).json({ 
      success: true,
      message: 'Notification processed successfully' 
    });

  } catch (error) {
    console.error('Notification Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}