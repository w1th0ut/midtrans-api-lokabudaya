// File: pages/api/check-status.js
import midtransClient from 'midtrans-client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Initialize Midtrans Core API
    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    console.log('Checking status for order:', order_id);

    // Get transaction status from Midtrans
    const statusResponse = await core.transaction.status(order_id);
    
    console.log('Status response:', statusResponse);

    res.status(200).json({
      success: true,
      data: statusResponse
    });

  } catch (error) {
    console.error('Check status error:', error);
    
    if (error.httpStatusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}