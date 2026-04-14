import Stripe from 'stripe';
import { prisma } from './db';

import { getStripe } from './stripe';

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const tier = session.metadata?.tier || 'solo';

  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price'],
    });

    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!stripeCustomer) {
      console.error('Stripe customer not found:', customerId);
      return;
    }

    const priceId = (subscription.items.data[0]?.price.id || '') as string;
    const productId = (subscription.items.data[0]?.price.product || '') as string;

    const currentPeriodEnd = (subscription as any).current_period_end 
      ? new Date((subscription as any).current_period_end * 1000) 
      : new Date();

    await prisma.stripeSubscription.upsert({
      where: { subscriptionId },
      create: {
        stripeCustomerId: stripeCustomer.id,
        subscriptionId,
        priceId,
        productId,
        tier,
        status: subscription.status,
        currentPeriodEnd,
      },
      update: {
        status: subscription.status,
        currentPeriodEnd,
        priceId,
      },
    });

    await prisma.user.update({
      where: { id: stripeCustomer.userId },
      data: { subscriptionTier: tier },
    });

    console.log(`Subscription created for customer ${customerId}: ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!stripeCustomer) {
      console.error('Stripe customer not found:', customerId);
      return;
    }

    const paidAt = invoice.status_transitions?.paid_at 
      ? new Date(invoice.status_transitions.paid_at * 1000) 
      : null;
    const dueDate = invoice.due_date 
      ? new Date(invoice.due_date * 1000) 
      : null;

    await prisma.stripeInvoice.upsert({
      where: { invoiceId: invoice.id },
      create: {
        stripeCustomerId: stripeCustomer.id,
        invoiceId: invoice.id,
        number: invoice.number,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status as string,
        paidAt,
        dueDate,
        invoiceUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
      },
      update: {
        status: invoice.status as string,
        paidAt,
        amount: invoice.amount_paid,
      },
    });

    console.log(`Invoice paid for customer ${customerId}: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling invoice paid:', error);
    throw error;
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!stripeCustomer) {
      console.error('Stripe customer not found:', customerId);
      return;
    }

    await prisma.stripeSubscription.update({
      where: { subscriptionId: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: stripeCustomer.userId },
      data: { subscriptionTier: 'free' },
    });

    console.log(`Subscription canceled for customer ${customerId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

export async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  try {
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!stripeCustomer) {
      console.error('Stripe customer not found:', customerId);
      return;
    }

    const updatedPeriodEnd = (subscription as any).current_period_end 
      ? new Date((subscription as any).current_period_end * 1000) 
      : new Date();

    await prisma.stripeSubscription.update({
      where: { subscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodEnd: updatedPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    console.log(`Subscription updated for customer ${customerId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}
