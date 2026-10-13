import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PricingOption } from 'libs/access/src/enums/course.enum';
import Stripe from 'stripe';
import { Settings } from 'libs/database/src/entities/settings.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StripePaymentService {
  private stripe: Stripe | null = null;

  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>
  ) { }

  private async getStripe(): Promise<Stripe> {
    if (this.stripe) return this.stripe;

    const settings = await this.settingsRepository.find({
      order: { id: 'ASC' },
      take: 1
    }).then(res => res[0]);

    if (!settings?.stripeSecretKey) {
      throw new InternalServerErrorException(
        'Stripe secret key not configured in settings'
      );
    }

    this.stripe = new Stripe(settings.stripeSecretKey);
    return this.stripe;
  }

  async paymentIntent(paymentData: { totalAmount: number, currency?: string, metadata?: Record<string, any>, customerId?: string }) {
    try {
      if (!paymentData.totalAmount || paymentData.totalAmount <= 0)
        throw new InternalServerErrorException('Invalid payment amount');

      const stripe = await this.getStripe();

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(paymentData.totalAmount * 100),
        currency: paymentData.currency ?? 'usd',
        metadata: paymentData.metadata ?? {},
        automatic_payment_methods: {
          enabled: true,
        },
        customer: paymentData.customerId
      });

      console.log('✅ STRIPE PAYMENT INTENT CREATED →', paymentIntent.id);
      return paymentIntent;
    } catch (error: any) {
      console.error('STRIPE_PAYMENT_INTENT_ERROR:', error?.message ?? error);
      throw new InternalServerErrorException(error?.message ?? 'Payment intent creation failed');
    }
  }

  async createSubscription(customerId: string, priceId: string, metadata: Record<string, any>) {
    try {
      const stripe = await this.getStripe();

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata,
      });
      return subscription;
    } catch (error: any) {
      console.error('CREATE_SUBSCRIPTION_ERROR:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      const stripe = await this.getStripe();

      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('RETRIEVE_PAYMENT_INTENT_ERROR:', error);
      throw new InternalServerErrorException('Failed to retrieve payment intent');
    }
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    try {
      const stripe = await this.getStripe();

      const canceledIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      console.log('PAYMENT INTENT CANCELLED →', canceledIntent.id);
      return canceledIntent;
    } catch (error: any) {
      console.error('CANCEL_PAYMENT_INTENT_ERROR:', error?.message ?? error);
      throw new InternalServerErrorException(error?.message ?? 'Failed to cancel payment intent');
    }
  }

  async createStripePrice(courseTitle: string, planOption: PricingOption, amount: number, interval: 'month' | 'year', interval_count: number) {
    const stripe = await this.getStripe();
    const product = await stripe.products.create({
      name: `${courseTitle} (${planOption})`,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100),
      currency: 'usd',
      recurring: {
        interval,
        interval_count
      }
    });

    return price.id;
  }

  async createCustomer(name: string, email: string): Promise<string> {
    try {
      const stripe = await this.getStripe();
      const customer = await stripe.customers.create({
        name,
        email,
      });
      console.log('✅ STRIPE CUSTOMER CREATED →', customer.id);
      return customer.id;
    } catch (error: any) {
      console.error('CREATE_STRIPE_CUSTOMER_ERROR:', error?.message ?? error);
      throw new InternalServerErrorException(error?.message ?? 'Stripe customer creation failed');
    }
  }
}
