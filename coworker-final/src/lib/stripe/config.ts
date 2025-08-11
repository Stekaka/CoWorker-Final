import Stripe from 'stripe'

// Server-side Stripe client (requires secret key)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    monthlyPriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID!,
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Up to 1,000 contacts',
      'Basic CRM features',
      'Email templates',
      'Mobile app access',
      'Basic reporting',
      'Email support'
    ],
    limits: {
      contacts: 1000,
      deals: 500,
      users: 3,
      storage_gb: 5
    }
  },
  professional: {
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    monthlyPriceId: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID!,
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [
      'Up to 10,000 contacts',
      'Advanced automations',
      'Email campaigns',
      'Sales pipeline management',
      'Advanced reporting & analytics',
      'API access',
      'Integrations',
      'Priority support'
    ],
    limits: {
      contacts: 10000,
      deals: 5000,
      users: 10,
      storage_gb: 50
    }
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Full-featured solution for large organizations',
    monthlyPriceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
    yearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID!,
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      'Unlimited contacts',
      'AI-powered features',
      'Custom integrations',
      'Advanced security',
      'Custom reporting',
      'White-label options',
      'Dedicated account manager',
      '24/7 phone support'
    ],
    limits: {
      contacts: -1, // unlimited
      deals: -1,
      users: -1,
      storage_gb: 500
    }
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Helper functions for Stripe operations
export class StripeService {
  static async createCustomer(email: string, name: string, userId: string) {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        userId
      }
    })
  }

  static async createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    userId
  }: {
    customerId?: string
    priceId: string
    successUrl: string
    cancelUrl: string
    userId: string
  }) {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId
      },
      subscription_data: {
        metadata: {
          userId
        }
      }
    }

    if (customerId) {
      sessionParams.customer = customerId
    } else {
      sessionParams.customer_creation = 'always'
    }

    return await stripe.checkout.sessions.create(sessionParams)
  }

  static async createBillingPortalSession(customerId: string, returnUrl: string) {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
  }

  static async getSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId)
  }

  static async cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
  }

  static async reactivateSubscription(subscriptionId: string) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })
  }

  static async updateSubscription(subscriptionId: string, priceId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
      proration_behavior: 'create_prorations',
    })
  }

  static getPlanFromPriceId(priceId: string): SubscriptionPlan | null {
    for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      if (plan.monthlyPriceId === priceId || plan.yearlyPriceId === priceId) {
        return planKey as SubscriptionPlan
      }
    }
    return null
  }

  static async getCustomerByUserId(userId: string) {
    const customers = await stripe.customers.list({
      limit: 1,
      expand: ['data.subscriptions'],
    })

    return customers.data.find(customer => 
      customer.metadata?.userId === userId
    )
  }

  static async createInvoice({
    customerId,
    items,
    description,
    metadata
  }: {
    customerId: string
    items: Array<{
      description: string
      amount: number
      quantity?: number
    }>
    description?: string
    metadata?: Record<string, string>
  }) {
    // Create invoice items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: Math.round(item.amount * 100), // Convert to cents
        currency: 'sek',
        description: item.description,
        quantity: item.quantity || 1,
      })
    }

    // Create and send invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      description,
      metadata,
      auto_advance: true, // Automatically finalize and send
    })

    if (!invoice.id) {
      throw new Error('Failed to create invoice')
    }

    return await stripe.invoices.finalizeInvoice(invoice.id, {})
  }
}

// Webhook event types
export type StripeWebhookEvent = 
  | 'customer.subscription.created'
  | 'customer.subscription.updated' 
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.created'
  | 'checkout.session.completed'

// Helper to verify webhook signatures
export function verifyStripeWebhook(payload: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
