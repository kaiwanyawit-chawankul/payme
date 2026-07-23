import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4242;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

app.post('/charge', async (req, res) => {
  const { amount } = req.body || {};

  if (!amount) {
    return res.status(400).json({ error: 'Missing amount.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key is not configured.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      description: `Donation of $${amount} via Payme demo`
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'PaymentIntent creation failed.' });
  }
});

app.post('/api/charge', async (req, res) => {
  const { amount } = req.body || {};

  if (!amount) {
    return res.status(400).json({ error: 'Missing amount.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key is not configured.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      description: `Donation of $${amount} via Payme demo`
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'PaymentIntent creation failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
