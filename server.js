const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = process.env.INTEGRATION_ID;
const IFRAME_ID = process.env.IFRAME_ID;

app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, email, phone, name } = req.body;

    const authRequest = await axios.post(
      'https://accept.paymob.com/api/auth/tokens',
      { api_key: PAYMOB_API_KEY }
    );
    const authToken = authRequest.data.token;

    const orderRequest = await axios.post(
      'https://accept.paymob.com/api/ecommerce/orders',
      {
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        currency: 'EGP',
        merchant_order_id: 'YB_' + Date.now(),
        notify_user: true
      }
    );
    const orderId = orderRequest.data.id;

    const paymentRequest = await axios.post(
      'https://accept.paymob.com/api/acceptance/payment_keys',
      {
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        currency: 'EGP',
        order_id: orderId,
        integration_id: INTEGRATION_ID,
        billing_data: {
          email: email || 'no-email@example.com',
          first_name: name || 'User',
          phone: phone || '01000000000',
          apartment: 'NA',
          floor: 'NA',
          street: 'NA',
          building: 'NA',
          city: 'Cairo',
          country: 'EG',
          postal_code: 'NA',
          state: 'NA',
          last_name: 'User'
        }
      }
    );

    const paymentToken = paymentRequest.data.token;

    res.json({
      success: true,
      payment_token: paymentToken,
      iframe_url:
        'https://accept.paymob.com/api/acceptance/iframes/' +
        IFRAME_ID +
        '?payment_token=' +
        paymentToken
    });
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

app.post('/api/payment-callback', (req, res) => {
  console.log('Payment callback:', req.body);
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.json({ status: 'Yalla Banking Backend is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
