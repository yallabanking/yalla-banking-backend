# YALLA BANKING BACKEND

Backend server for YALLA BANKING ATS SCORE payment gateway integration with Paymob.

## 📋 Prerequisites

- Node.js 18 or higher
- Paymob account with:
  - API Key
  - Integration ID
  - Iframe ID

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file and add your Paymob credentials:

```env
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TWpBNU5UYzNMQ0p1WVcxbElqb2lNVGM0TWpRd05EZzBNaTQ1TnpBM09UWWlmUS4zWHJWR09yRUtPRjF6YWhwM0VXTlhVLVJ1ekVDd2xlaWd6cVFNMWxvMWNKU0RUbTZWQjJRcFpVQVRCVW1oMzdwYnhIX3hnNzM5WjBOZzhvQ0ZZamFWZw==
INTEGRATION_ID=2250398
IFRAME_ID=642650
RETURN_URL=https://yallabanking.github.io/ATS/
```

### 3. Run Locally

```bash
npm start
```

Server will run on `http://localhost:3000`

## 🚀 Deploy to Render

### Step 1: Push to GitHub

1. Create a new repository on GitHub: `yalla-banking-backend`
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Yallabanking/yalla-banking-backend.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `yalla-banking-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   - `PAYMOB_API_KEY` = ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TWpBNU5UYzNMQ0p1WVcxbElqb2lNVGM0TWpRd05EZzBNaTQ1TnpBM09UWWlmUS4zWHJWR09yRUtPRjF6YWhwM0VXTlhVLVJ1ekVDd2xlaWd6cVFNMWxvMWNKU0RUbTZWQjJRcFpVQVRCVW1oMzdwYnhIX3hnNzM5WjBOZzhvQ0ZZamFWZw==
   - `INTEGRATION_ID` = 2250398
   - `IFRAME_ID` = 642650
   - `RETURN_URL` = https://yallabanking.github.io/yalla-banking-backend/

6. Click "Create Web Service"

### Step 3: Update Frontend

After deployment, update your `index.html` to point to your Render backend:

```javascript
// Change this line in index.html:
const BACKEND_URL = 'https://yalla-banking-backend.onrender.com';
```

## 📡 API Endpoints

### Health Check
```
GET /
```

### Create Payment
```
POST /api/create-payment
Body: {
  "amount": 10,
  "email": "user@example.com",
  "phone": "01012345678",
  "name": "Ahmed Ali",
  "description": "CV Review"
}
```

Response:
```json
{
  "success": true,
  "order_id": 12345,
  "payment_token": "token_here",
  "iframe_url": "https://accept.paymob.com/...",
  "amount": 10,
  "currency": "EGP"
}
```

### Payment Callback
```
POST /api/payment-callback
```

Paymob will send payment status here.

### Get Payment Status
```
GET /api/payment-status/:orderId
```

## 🔒 Security Notes

- Never commit `.env` file to GitHub
- Keep your API Key secure
- Use HTTPS in production
- Validate all inputs

## 📞 Support

For issues or questions:
- WhatsApp: 01558232376
- Website: www.yallabanking.com

## 📄 License

All rights reserved to Yalla Banking © 2025
