import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PricingOption } from 'libs/access/src/enums/course.enum';
import { Settings } from 'libs/database/src/entities/settings.entity';
import { Repository } from 'typeorm';
import axios from 'axios';

interface PaypalConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  webhookId?: string;
}

@Injectable()
export class PaypalPaymentService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  private async getConfig(): Promise<PaypalConfig> {
    const settings = await this.settingsRepository
      .find({ order: { id: 'ASC' }, take: 1 })
      .then((res) => res[0]);

    if (!settings?.paypalClientId || !settings?.paypalClientSecret) {
      throw new InternalServerErrorException('PayPal credentials not configured in settings');
    }

    const baseUrl =
      settings.paypalMode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    return {
      baseUrl,
      clientId: settings.paypalClientId,
      clientSecret: settings.paypalClientSecret,
      webhookId: settings.paypalWebhookId,
    };
  }

  private async getAccessToken(config: PaypalConfig): Promise<string> {
    const res = await axios.post(
      `${config.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: { username: config.clientId, password: config.clientSecret },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    return res.data.access_token;
  }

  private async request<T = any>(method: 'get' | 'post', path: string, body?: any): Promise<T> {
    const config = await this.getConfig();
    const token = await this.getAccessToken(config);
    const res = await axios.request<T>({
      method,
      url: `${config.baseUrl}${path}`,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  }

  // One-time order (used for LIFETIME / single payment)
  async createOrder(data: { totalAmount: number; currency?: string; enrollmentId?: string }) {
    try {
      if (!data.totalAmount || data.totalAmount <= 0) throw new InternalServerErrorException('Invalid payment amount');

      const order = await this.request('post', '/v2/checkout/orders', {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: data.currency ?? 'USD',
              value: data.totalAmount.toFixed(2),
            },
            custom_id: data.enrollmentId,
          },
        ],
      });
      console.log('✅ PAYPAL ORDER CREATED →', order.id);
      return order;
    } catch (error: any) {
      console.error('PAYPAL_ORDER_ERROR:', error?.response?.data ?? error?.message ?? error);
      throw new InternalServerErrorException('PayPal order creation failed');
    }
  }

  async captureOrder(orderId: string) {
    try {
      return await this.request('post', `/v2/checkout/orders/${orderId}/capture`, {});
    } catch (error: any) {
      console.error('PAYPAL_CAPTURE_ERROR:', error?.response?.data ?? error?.message ?? error);
      throw new InternalServerErrorException('PayPal order capture failed');
    }
  }

  async getOrder(orderId: string) {
    return this.request('get', `/v2/checkout/orders/${orderId}`);
  }

  // Product + Plan (subscriptions)
  async createProduct(name: string): Promise<string> {
    const product = await this.request('post', '/v1/catalogs/products', { name, type: 'SERVICE' });
    return product.id;
  }

  async createPlan(data: {
    productId: string;
    courseTitle: string;
    planOption: PricingOption;
    amount: number;
    interval: 'MONTH' | 'YEAR';
    intervalCount: number;
    currency?: string;
  }): Promise<string> {
    try {
      const plan = await this.request('post', '/v1/billing/plans', {
        product_id: data.productId,
        name: `${data.courseTitle} (${data.planOption})`,
        billing_cycles: [
          {
            frequency: { interval_unit: data.interval, interval_count: data.intervalCount },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0, // 0 = renew indefinitely until cancelled
            pricing_scheme: {
              fixed_price: {
                value: data.amount.toFixed(2),
                currency_code: data.currency ?? 'USD',
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 1,
        },
      });
      console.log('✅ PAYPAL PLAN CREATED →', plan.id);
      return plan.id;
    } catch (error: any) {
      console.error('PAYPAL_CREATE_PLAN_ERROR:', error?.response?.data ?? error?.message ?? error);
      throw new InternalServerErrorException('PayPal plan creation failed');
    }
  }

  async createSubscription(data: { planId: string; enrollmentId?: string; returnUrl?: string; cancelUrl?: string }) {
    try {
      const subscription = await this.request('post', '/v1/billing/subscriptions', {
        plan_id: data.planId,
        custom_id: data.enrollmentId,
        application_context: {
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: data.returnUrl,
          cancel_url: data.cancelUrl,
        },
      });
      console.log('✅ PAYPAL SUBSCRIPTION CREATED →', subscription.id);
      return subscription;
    } catch (error: any) {
      console.error('PAYPAL_CREATE_SUBSCRIPTION_ERROR:', error?.response?.data ?? error?.message ?? error);
      throw new InternalServerErrorException('PayPal subscription creation failed');
    }
  }

  async getSubscription(subscriptionId: string) {
    return this.request('get', `/v1/billing/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId: string, reason = 'Cancelled by user') {
    try {
      await this.request('post', `/v1/billing/subscriptions/${subscriptionId}/cancel`, { reason });
      console.log('PAYPAL SUBSCRIPTION CANCELLED →', subscriptionId);
      return true;
    } catch (error: any) {
      console.error('PAYPAL_CANCEL_SUBSCRIPTION_ERROR:', error?.response?.data ?? error?.message ?? error);
      throw new InternalServerErrorException('PayPal subscription cancellation failed');
    }
  }

  // Verify webhook signature using PayPal's verification endpoint
  async verifyWebhookSignature(headers: Record<string, any>, body: any): Promise<boolean> {
    try {
      const config = await this.getConfig();
      if (!config.webhookId) {
        console.error('PayPal webhook id not configured');
        return false;
      }

      const result = await this.request('post', '/v1/notifications/verify-webhook-signature', {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: config.webhookId,
        webhook_event: body,
      });

      return result?.verification_status === 'SUCCESS';
    } catch (error: any) {
      console.error('PAYPAL_VERIFY_WEBHOOK_ERROR:', error?.response?.data ?? error?.message ?? error);
      return false;
    }
  }
}
