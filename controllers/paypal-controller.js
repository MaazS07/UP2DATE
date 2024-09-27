const axios = require('axios');
const UserModel = require('../model/UserModal');

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

exports.createPayPalOrder = async (req, res) => {
  const { userId, plan } = req.body;

  let amount;
  switch (plan) {
    case 'free':
      try {
        await UserModel.findOneAndUpdate({ firebaseUid: userId }, {
          subscriptionStatus: 'active',
          subscriptionEnd: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day free trial
        });
        return res.json({ success: true, message: 'Free trial activated' });
      } catch (error) {
        console.error('Free trial activation error:', error);
        return res.status(500).json({ error: 'Failed to activate free trial' });
      }
    case 'monthly':
      amount = '7.00'; // $7
      break;
    case 'yearly':
      amount = '70.00'; // $70
      break;
    default:
      return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const order = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount,
        },
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
      }],
      application_context: {
        brand_name: 'Your App Name',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: 'http://localhost:5000/api/return',
        cancel_url: 'http://localhost:5000/api/cancel',
      },
    };

    const response = await axios.post(`${PAYPAL_API_URL}/v2/checkout/orders`, order, {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    res.json({ id: response.data.id });
  } catch (error) {
    console.error('PayPal order creation error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create order', details: error.response ? error.response.data : error.message });
  }
};

exports.capturePayPalOrder = async (req, res) => {
  const { orderID, userId, plan } = req.body;

  try {
    const response = await axios.post(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {}, {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET,
      },
    });

    if (response.data.status === 'COMPLETED') {
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + (plan === 'yearly' ? 12 : 1));

      await UserModel.findOneAndUpdate({ firebaseUid: userId }, {
        subscriptionStatus: 'active',
        subscriptionEnd: subscriptionEnd,
      });

      res.json({ success: true, message: 'Payment successful and subscription activated' });
    } else {
      throw new Error('Payment not completed');
    }
  } catch (error) {
    console.error('PayPal capture error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to capture payment', details: error.response ? error.response.data : error.message });
  }
};