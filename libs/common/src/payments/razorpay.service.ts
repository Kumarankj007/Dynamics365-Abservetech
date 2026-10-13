import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PricingOption } from "libs/access/src/enums/course.enum";
import crypto from 'crypto'
import { Settings } from "libs/database/src/entities/settings.entity";
import Razorpay from "razorpay";
import { Repository } from "typeorm";


@Injectable()
export class RazorpayPaymentService {
    private razorpay: Razorpay | null = null

    constructor(
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>
    ) { }

    private async getRazorpay(): Promise<Razorpay> {
        if (this.razorpay) return this.razorpay

        const settings = await this.settingsRepository.find({
            order: { id: 'ASC' },
            take: 1
        }).then(res => res[0]);

        if (!settings?.razorpayKeyId || !settings?.razorpayKeySecret) {
            throw new InternalServerErrorException(
                'Razorpay keys not configured in settings'
            );
        }

        this.razorpay = new Razorpay({
            key_id: settings.razorpayKeyId,
            key_secret: settings.razorpayKeySecret,
        })
        return this.razorpay
    }

    // create razorpay order
    async createOrder(data: { totalAmount: number, currency?: string, metadata?: Record<string, string>, receipt?: string }) {
        try {
            if (!data.totalAmount || data.totalAmount <= 0) throw new InternalServerErrorException('Invalid payment amount')

            const razorpay = await this.getRazorpay()
            
            const order = await razorpay.orders.create({
                amount: Math.round(data.totalAmount * 100),
                currency: data.currency ?? 'INR',
                receipt: data.receipt,
                notes: data.metadata ?? {}
            })

            console.log('✅ RAZORPAY ORDER CREATED →', order.id);
            return order
        } catch (error: any) {
            console.error('RAZORPAY_ORDER_ERROR:', error?.message ?? error);
            throw new InternalServerErrorException(error?.message ?? 'Razorpay order creation failed');

        }
    }

    // Fetch order
    async retrieveOrder(orderId: string) {
        try {
            const razorpay = await this.getRazorpay();
            return await razorpay.orders.fetch(orderId);
        } catch (error: any) {
            console.error('RAZORPAY_ORDER_ERROR:', error?.message ?? error);
            throw new InternalServerErrorException(error?.message ?? 'Razorpay order retrieval failed');
        }
    }

    // Fetch payment
    async retrievePayment(paymentId: string) {
        try {
            const razorpay = await this.getRazorpay()
            return await razorpay.payments.fetch(paymentId)
        } catch (error: any) {
            console.error('RAZORPAY_PAYMENT_ERROR:', error?.message ?? error);
            throw new InternalServerErrorException(error?.message ?? 'Razorpay payment retrieval failed');
        }
    }

    // create plans
    async createPlan(data: { courseTitle: string, planOption: PricingOption, amount: number, interval: 'monthly' | 'yearly', intervalCount: number, currency?: string }): Promise<string> {
        try {
            const razorpay = await this.getRazorpay();

            const plan = await razorpay.plans.create({
                period: data.interval,
                interval: data.intervalCount,
                item: {
                    name: `${data.courseTitle} (${data.planOption})`,
                    amount: Math.round(data.amount * 100),
                    currency: data.currency ?? 'INR',
                },
                notes: {
                    planOption: data.planOption,
                },
            });

            console.log('✅ RAZORPAY PLAN CREATED →', plan.id);
            return plan.id;
        } catch (error: any) {
            console.error('RAZORPAY_CREATE_PLAN_ERROR:', error?.message ?? error);
            throw new InternalServerErrorException(
                error?.message ?? 'Razorpay plan creation failed',
            );
        }
    }

    // create razorpay subscription
    async createSubscription(data: { planId: string, totalCount: number, customerId?: string, metadata?: Record<string, string>, startAt?: number }) {
        try {
            const razorpay = await this.getRazorpay();

            const subscriptionPayload: any = {
                plan_id: data.planId,
                total_count: data.totalCount,
                notes: data.metadata ?? {},
            };

            if (data.customerId) subscriptionPayload.customer_id = data.customerId;
            if (data.startAt) subscriptionPayload.start_at = data.startAt;

            const subscription = await razorpay.subscriptions.create(subscriptionPayload);

            console.log('✅ RAZORPAY SUBSCRIPTION CREATED →', subscription.id);
            return subscription;
        } catch (error: any) {
            console.error('RAZORPAY_CREATE_SUBSCRIPTION_ERROR:', error?.message ?? error);
            throw new InternalServerErrorException(
                error?.message ?? 'Razorpay subscription creation failed',
            );
        }
    }

    // cancel subscription
    async cancelSubscription(subscriptionId: string, cancelAtCycleEnd = true) {
        try {
            const razorpay = await this.getRazorpay();
            const result = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd)
            console.log('RAZORPAY SUBSCRIPTION CANCELLED →', subscriptionId);
            return result
        } catch (error: any) {
            console.error('RAZORPAY_CANCEL_SUBSCRIPTION_ERROR:', error?.message ?? error);
            throw new InternalServerErrorException(
                error?.message ?? 'Razorpay subscription cancellation failed',
            );
        }
    }

    // create customer
    async createCustomer(name: string, email: string, contact?: string) {
        try {
            const razorpay = await this.getRazorpay()

            const customer = await razorpay.customers.create({
                name,
                email,
                contact: contact ?? ''
            })
            console.log('✅ RAZORPAY CUSTOMER CREATED →', customer.id);
            return customer.id
        } catch (error: any) {
            console.error('RAZORPAY_CREATE_CUSTOMER_ERROR:', error?.message ?? error);
            throw new InternalServerErrorException(error?.message ?? 'Razorpay customer creation failed');
        }
    }


    //Verify Razorpay webhook signature
    verifyWebhookSignature(rawBody: Buffer | string, signature: string, secret: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');
        return expectedSignature === signature;
    }


    // Verify Razorpay payment signature (for checkout callback)
    verifyPaymentSignature(data: { orderId: string, paymentId: string, signature: string, secret: string }): boolean {
        const body = `${data.orderId}|${data.paymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', data.secret)
            .update(body)
            .digest('hex');
        return expectedSignature === data.signature;
    }
}