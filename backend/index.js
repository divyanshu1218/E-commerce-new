const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Razorpay setup
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// PayPal setup
paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Legacy routes for backward compatibility
app.get('/api/products', (req, res) => {
    res.redirect('/api/products');
});

app.post('/api/create-order', async (req, res) => {
    const { amount, currency } = req.body;
    const options = {
        amount: amount * 100,
        currency: currency,
        receipt: `receipt_order_${Date.now()}`
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).send('Error creating Razorpay order');
    }
});

app.post('/api/verify-payment', (req, res) => {
    const { order_id, payment_id, signature } = req.body;
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(order_id + "|" + payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === signature) {
        res.json({ success: true, message: "Payment verified successfully" });
    } else {
        res.json({ success: false, message: "Payment verification failed" });
    }
});

app.post('/api/paypal-create-payment', (req, res) => {
    const { total, currency, description } = req.body;

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/api/paypal-success",
            "cancel_url": "http://localhost:5000/api/paypal-cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": total,
                    "currency": currency,
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": currency,
                "total": total
            },
            "description": description
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.error('Error creating PayPal payment:', error.response);
            res.status(500).send('Error creating PayPal payment');
        } else {
            for(let i = 0; i < payment.links.length; i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.json({ approvalUrl: payment.links[i].href });
                }
            }
        }
    });
});

app.get('/api/paypal-success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.error('Error executing PayPal payment:', error.response);
            res.status(500).send('Error executing PayPal payment');
        } else {
            console.log(JSON.stringify(payment));
            res.send('Payment successful with PayPal! You can close this window.');
        }
    });
});

app.get('/api/paypal-cancel', (req, res) => {
    res.send('Payment cancelled with PayPal.');
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
}); 