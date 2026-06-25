const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Paymob Configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = parseInt(process.env.INTEGRATION_ID);
const IFRAME_ID = process.env.IFRAME_ID;

// Validation
if (!PAYMOB_API_KEY || !INTEGRATION_ID || !IFRAME_ID) {
  console.error('❌ Missing environment variables!');
  console.error('Please set PAYMOB_API_KEY, INTEGRATION_ID, and IFRAME_ID in .env file');
  process.exit(1);
}

console.log('✅ Configuration loaded successfully');
console.log('📋 Integration ID:', INTEGRATION_ID);
console.log('📋 Iframe ID:', IFRAME_ID);

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    status: '✅ Yalla Banking Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Create Payment
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, email, phone, name, description } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    console.log('\n📝 Creating payment...');
    console.log('Amount:', amount, 'EGP');
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Name:', name);

    // Step 1: Get Authentication Token
    console.log('\n🔐 Step 1: Getting auth token...');
    const authResponse = await axios.post(
      'https://accept.paymob.com/api/auth/tokens',
      { api_key: PAYMOB_API_KEY }
    );
    const authToken = authResponse.data.token;
    console.log('✅ Auth token received');

    // Step 2: Create Order
    console.log('\n📦 Step 2: Creating order...');
    const orderResponse = await axios.post(
      'https://accept.paymob.com/api/ecommerce/orders',
      {
        auth_token: authToken,
        amount_cents: Math.round(amount * 100), // Convert to cents
        currency: 'EGP',
        merchant_order_id: 'YB_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        items: [
          {
            name: description || 'Yalla Banking Service',
            amount_cents: Math.round(amount * 100),
            description: description || 'Yalla Banking ATS Score Service',
            quantity: 1
          }
        ],
        notify_user: true,
        delivery_needed: false
      }
    );
    const orderId = orderResponse.data.id;
    console.log('✅ Order created:', orderId);

    // Step 3: Get Payment Key
    console.log('\n🔑 Step 3: Getting payment key...');
    const paymentResponse = await axios.post(
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
          last_name: 'User',
          phone: phone || '01000000000',
          apartment: 'NA',
          floor: 'NA',
          street: 'NA',
          building: 'NA',
          city: 'Cairo',
          country: 'EG',
          state: 'NA',
          postal_code: 'NA'
        },
        return_url: process.env.RETURN_URL || 'https://yallabanking.github.io/ATS/'
      }
    );
    const paymentToken = paymentResponse.data.token;
    console.log('✅ Payment key received');

    // Generate Iframe URL
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentToken}`;

    console.log('\n✅ Payment created successfully!');
    console.log('🔗 Iframe URL:', iframeUrl);

    // Return response
    res.json({
      success: true,
      order_id: orderId,
      payment_token: paymentToken,
      iframe_url: iframeUrl,
      amount: amount,
      currency: 'EGP'
    });

  } catch (error) {
    console.error('\n❌ Payment error:');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      
      res.status(error.response.status).json({
        success: false,
        error: error.response.data.message || 'Payment failed',
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      });
    }
  }
});

// Payment Callback (when Paymob sends payment status)
app.post('/api/payment-callback', (req, res) => {
  console.log('\n📞 Payment callback received:');
  console.log('Data:', req.body);
  
  const {
    obj,
    success,
    amount_cents,
    order_id,
    data_message
  } = req.body;

  if (success === true) {
    console.log('✅ Payment successful!');
    console.log('Order ID:', order_id);
    console.log('Amount:', amount_cents / 100, 'EGP');
    
    // Here you can:
    // - Update database
    // - Send confirmation email
    // - Unlock the service for the user
    
  } else {
    console.log('❌ Payment failed');
    console.log('Message:', data_message);
  }

  res.json({ success: true });
});

// Get Payment Status
app.get('/api/payment-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get auth token
    const authResponse = await axios.post(
      'https://accept.paymob.com/api/auth/tokens',
      { api_key: PAYMOB_API_KEY }
    );
    const authToken = authResponse.data.token;

    // Get transaction data
    const transactionResponse = await axios.get(
      `https://accept.paymob.com/api/ecommerce/transactions?order_id=${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    res.json({
      success: true,
      data: transactionResponse.data
    });

  } catch (error) {
    console.error('Error getting payment status:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🚀 Yalla Banking Backend Server');
  console.log('='.repeat(40));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(40));
});
