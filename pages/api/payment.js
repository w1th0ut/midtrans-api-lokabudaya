import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap
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
    const { order_id, gross_amount, customer_details, item_details } = req.body;

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: gross_amount
      },
      customer_details: customer_details,
      item_details: item_details,
      credit_card: {
        secure: true
      }
    };

    const transaction = await snap.createTransaction(parameter);
    
    res.status(200).json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (error) {
    console.error('Midtrans Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}