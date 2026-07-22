const paymentServices = [
  {
    id: 'stripe',
    name: 'Stripe',
    label: 'Pay with Stripe',
    enabled: true,
    description: 'Secure donation support with Stripe.'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    label: 'Pay with PayPal',
    enabled: false,
    description: 'PayPal support is coming soon for alternate payment flows.'
  }
];

const amounts = [5, 10, 20, 50, 100];
let selectedAmount = 20;

const amountGrid = document.getElementById('amountGrid');
const buttonRow = document.getElementById('buttonRow');
const toast = document.getElementById('toast');
const stripeForm = document.getElementById('stripeForm');
const stripeSubmitButton = document.getElementById('stripeSubmitButton');
const cardErrors = document.getElementById('cardErrors');

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:4242' : '/api';

let stripe;
let elements;
let card;

function initStripe() {
  if (!window.Stripe) {
    showToast('Stripe.js failed to load. Please check your network.', 'warning');
    return;
  }

  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!stripePublishableKey) {
    showToast('Stripe publishable key is missing. Set STRIPE_PUBLISHABLE_KEY in .env.', 'warning');
    return;
  }

  stripe = Stripe(stripePublishableKey);
  elements = stripe.elements();
  card = elements.create('card', {
    style: {
      base: {
        color: '#0f172a',
        fontSize: '16px',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        '::placeholder': { color: '#64748b' }
      },
      invalid: {
        color: '#b91c1c'
      }
    }
  });

  card.mount('#cardElement');

  card.on('change', (event) => {
    cardErrors.textContent = event.error ? event.error.message : '';
    stripeSubmitButton.disabled = !event.complete;
  });
}

function renderAmountButtons() {
  amountGrid.innerHTML = '';

  amounts.forEach((amount) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pill ${amount === selectedAmount ? 'selected' : ''}`;
    button.textContent = `$${amount}`;
    button.addEventListener('click', () => {
      selectedAmount = amount;
      renderAmountButtons();
      showToast(`Donation amount set to $${amount}.`, 'info');
    });
    amountGrid.appendChild(button);
  });
}

function renderPaymentButtons() {
  buttonRow.innerHTML = '';

  paymentServices.forEach((service) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pay-button';
    button.dataset.service = service.id;
    button.textContent = service.label;
    button.disabled = !service.enabled;
    button.addEventListener('click', () => handlePayment(service));

    const card = document.createElement('div');
    card.className = 'payment-card';
    card.appendChild(button);

    const description = document.createElement('p');
    description.className = 'payment-description';
    description.textContent = service.description;
    card.appendChild(description);

    buttonRow.appendChild(card);
  });
}

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  window.clearTimeout(window.toastTimeout);
  window.toastTimeout = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

function showStripeForm() {
  stripeForm.classList.remove('hidden');
  stripeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function handlePayment(service) {
  if (!service.enabled) {
    showToast(`${service.name} support is coming soon.`, 'warning');
    return;
  }

  if (service.id === 'stripe') {
    showStripeForm();
    showToast(`Stripe payment form ready for $${selectedAmount}.`, 'info');
  }
}

async function handleStripeSubmit() {
  if (!stripe || !card) {
    showToast('Stripe is not available. Please reload the page.', 'warning');
    return;
  }

  stripeSubmitButton.disabled = true;
  const result = await stripe.createToken(card);

  if (result.error) {
    cardErrors.textContent = result.error.message;
    showToast('Stripe card details are invalid.', 'warning');
    stripeSubmitButton.disabled = false;
    return;
  }

  const endpoint = `${BACKEND_URL}/charge`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: result.token.id, amount: selectedAmount })
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    cardErrors.textContent = data.error || 'Unable to process payment.';
    showToast(`Payment failed: ${data.error || response.statusText}`, 'warning');
    stripeSubmitButton.disabled = false;
    return;
  }

  showToast(`Payment succeeded: ${data.charge.id}`, 'success');
  card.clear();
  stripeSubmitButton.disabled = true;
}

function init() {
  renderAmountButtons();
  renderPaymentButtons();
  initStripe();

  if (stripeSubmitButton) {
    stripeSubmitButton.addEventListener('click', handleStripeSubmit);
  }
}

init();
