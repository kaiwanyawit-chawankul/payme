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
  const { token, amount } = req.body;

  if (!token || !amount) {
    return res.status(400).json({ error: 'Missing token or amount.' });
  }

  try {
    const charge = await stripe.charges.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      source: token,
      description: `Donation of $${amount} via Payme demo`
    });

    return res.json({ charge });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Charge creation failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
