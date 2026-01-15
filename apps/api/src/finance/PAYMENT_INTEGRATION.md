# Payment Integration Module

## Overview

This module provides integration with payment gateways (Stripe and Asaas) for processing legal fees and generating payment links.

## Configuration

Add the following environment variables:

```env
# Payment Gateway Selection
PAYMENT_GATEWAY=stripe  # or 'asaas'

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://app.jurisnexo.com/pagamento/sucesso
STRIPE_CANCEL_URL=https://app.jurisnexo.com/pagamento/cancelado

# Asaas Configuration
ASAAS_API_KEY=...
ASAAS_ENVIRONMENT=sandbox  # or 'production'
ASAAS_WEBHOOK_SECRET=...

# Email Configuration
EMAIL_PROVIDER=sendgrid  # or 'smtp'
EMAIL_FROM=noreply@jurisnexo.com
EMAIL_FROM_NAME=JurisNexo

# SendGrid (if EMAIL_PROVIDER=sendgrid)
SENDGRID_API_KEY=...

# SMTP (if EMAIL_PROVIDER=smtp)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

## Services

### StripePaymentService

- `createPaymentIntent()` - Create payment intent
- `createCheckoutSession()` - Create hosted checkout page
- `getPaymentStatus()` - Check payment status
- `cancelPayment()` - Cancel pending payment
- `refundPayment()` - Process refund
- `processWebhook()` - Handle Stripe webhooks

### AsaasPaymentService

- Same interface as Stripe
- Better support for Brazilian payment methods (PIX, Boleto)
- Automatic customer management

### PaymentGatewayFactory

```typescript
// Use default gateway from config
const gateway = gatewayFactory.getGateway();

// Force specific gateway
const stripe = gatewayFactory.getGateway('stripe');

// Select based on payment method
const gateway = gatewayFactory.getGatewayByPaymentMethod('pix'); // Returns Asaas
```

### EmailService

Templates available:

- `sendPaymentConfirmation()` - ✅ Success notification
- `sendPaymentFailed()` - ❌ Failure notification
- `sendPaymentReminder()` - ⏰ Payment reminder
- `sendPaymentLink()` - 🔗 Payment link
- `sendInvoice()` - 📄 Invoice with PDF attachment

## Webhook Endpoints

### Stripe

```
POST /webhooks/stripe
Header: stripe-signature: <signature>
```

### Asaas

```
POST /webhooks/asaas
Header: asaas-access-token: <token>
```

## Testing

### Test Stripe Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:4000/webhooks/stripe

# Simulate payment success
curl -X POST http://localhost:4000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{
    "id": "evt_test_webhook",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 50000,
        "status": "succeeded",
        "metadata": {
          "honorarioId": "hon_123",
          "escritorioId": "esc_456",
          "clienteId": "cli_789"
        }
      }
    }
  }'
```

### Test Asaas Webhook

```bash
curl -X POST http://localhost:4000/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: test_token" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test_123",
      "value": 500.00,
      "paymentDate": "2026-01-15",
      "externalReference": "{\"honorarioId\": \"hon_123\", \"escritorioId\": \"esc_456\"}"
    }
  }'
```

### Test Email Sending

```bash
# Check email service logs when webhook is processed
# Emails are logged if transporter is not configured
```

## Flow Diagram

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Backend API    │      │ Payment Gateway │
│   (Next.js)     │      │   (NestJS)       │      │ (Stripe/Asaas)  │
└────────┬────────┘      └────────┬─────────┘      └────────┬────────┘
         │                        │                         │
         │  POST /checkout        │                         │
         │───────────────────────>│                         │
         │                        │  createCheckoutSession  │
         │                        │────────────────────────>│
         │                        │                         │
         │                        │    { checkoutUrl }      │
         │                        │<────────────────────────│
         │   { checkoutUrl }      │                         │
         │<───────────────────────│                         │
         │                        │                         │
         │   Redirect to Gateway  │                         │
         │─────────────────────────────────────────────────>│
         │                        │                         │
         │                        │     POST /webhooks      │
         │                        │<────────────────────────│
         │                        │                         │
         │                        │  Update DB + Send Email │
         │                        │──────────┐              │
         │                        │          │              │
         │                        │<─────────┘              │
         │                        │                         │
         │   Redirect to Success  │                         │
         │<─────────────────────────────────────────────────│
         │                        │                         │
```
