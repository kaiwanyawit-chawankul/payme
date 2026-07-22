import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { token, amount } = req.body || {};

  if (!token || !amount) {
    return res.status(400).json({ error: 'Missing token or amount.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key is not configured.' });
  }

  try {
    const charge = await stripe.charges.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      source: token,
      description: `Donation of $${amount} via Payme demo`
    });

    return res.status(200).json({ charge });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Charge creation failed.' });
  }
}
