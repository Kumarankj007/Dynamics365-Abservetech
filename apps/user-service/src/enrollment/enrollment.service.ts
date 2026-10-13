import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PaginationDto } from 'libs/common/src/pagination/pagination.dto';
import { StripePaymentService } from 'libs/common/src/payments/stripe.service';
import { RazorpayPaymentService } from 'libs/common/src/payments/razorpay.service'
import { PaypalPaymentService } from 'libs/common/src/payments/paypal.service'
import { MailHelper } from 'libs/common/src/utils/mail/mailer.helper';
import { Course } from 'libs/database/src/entities/course.entity';
import { Tax } from 'libs/database/src/entities/tax.entity';
import { Admin } from 'libs/database/src/entities/admin.entity';
import { User } from 'libs/database/src/entities/user.entity';
import { Status, PaymentMethod, PaymentStatus, PricingOption, SubscriptionStatus } from 'libs/access/src/enums/course.enum'
import { FareEstimateDto, CreateEnrollmentDto, CheckPaymentStatusDto, UpdateProgressDto, AdminGrantAccessDto, CheckRazorpayPaymentDto, CheckPaypalPaymentDto } from './dto/enrollment.dto';
import { Enrollment } from 'libs/database/src/entities/enrollments.entity';
import { ApprovalQueue, ApprovalQueueStatus } from 'libs/database/src/entities/approval-queue.entity';
import { CommissionHelper } from 'libs/common/src/utils/commission/commission.helper';
import Stripe from 'stripe';
import { SettingsService } from 'apps/admin-service/src/settings/settings.service';
import { Transaction } from 'libs/database/src/entities/transactions.entity';
import Razorpay from 'razorpay';


@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(ApprovalQueue)
    private readonly saleApprovalQueueRepository: Repository<ApprovalQueue>,
    private readonly stripePaymentService: StripePaymentService,
    private readonly razorpayPaymentService: RazorpayPaymentService,
    private readonly paypalPaymentService: PaypalPaymentService,
    private readonly settingsService: SettingsService,
    private readonly mailHelper: MailHelper,
    private readonly commissionHelper: CommissionHelper
  ) { }

  async fareEstimation(dto: FareEstimateDto) {
    try {

      const { courseId, pricingOption } = dto;

      const course: any = await this.courseRepository.findOne({
        where: { id: courseId, softDel: false },
      });

      if (!course) throw new NotFoundException('Course not found');

      const selectedPricing: any = course.pricingOptions.find(
        (p: any) => p.option === pricingOption,
      );

      if (!selectedPricing) throw new NotFoundException('This pricing option is not available for the course');

      const taxRecord = await this.taxRepository.findOneBy({});
      const taxPercentage = taxRecord ? Number(taxRecord.tax) : 0;

      const basePrice = selectedPricing.price;
      const taxAmount = (basePrice * taxPercentage) / 100;
      const finalAmount = basePrice + taxAmount;

      return {
        status: true,
        statusCode: 200,
        message: 'Fare estimation calculated successfully',
        courseId,
        pricingOption,
        basePrice,
        taxPercentage,
        taxAmount: Number(taxAmount.toFixed(2)),
        finalAmount: Number(finalAmount.toFixed(2)),
      };
    } catch (error: any) {
      console.error('Fare Estimation Error:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async createStripePayment(dto: CreateEnrollmentDto, userId: string) {
    try {
      const { planType, paymentMethod = PaymentMethod.STRIPE } = dto;

      const course: any = await this.courseRepository.findOne({
        where: { id: dto.courseId, softDel: false },
      });
      if (!course) throw new NotFoundException('Course not found');

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) throw new NotFoundException('User not found')

      const selectedPricing = course.pricingOptions.find(
        (p: any) => p.option === planType,
      );
      if (!selectedPricing)
        throw new NotFoundException('Selected pricing option not found for course');

      let customerId = user.stripeCustomerId
      if (!customerId) {
        const stripe = await (this.stripePaymentService as any).getStripe();

        const customer = await stripe.customers.create({
          metadata: { userId },
          name: user?.fullname,
          email: user?.email,
          description: `Payment for user ${userId}`
        })

        customerId = customer.id

        await this.userRepository.update(userId, {
          stripeCustomerId: customerId
        })
      }

      const basePrice = Number(selectedPricing.price);
      const taxRecord = await this.taxRepository.findOneBy({});
      const taxPercentage = taxRecord ? Number(taxRecord.tax) : 0;
      const taxAmount = (basePrice * taxPercentage) / 100;
      const totalAmount = basePrice + taxAmount;

      const enrollment = this.enrollmentRepository.create({
        userId,
        instructorId: course.creatorId,
        courseId: dto.courseId,
        planType,
        basePrice,
        taxPercentage,
        taxAmount,
        totalAmount,
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
      });
      await this.enrollmentRepository.save(enrollment);

      const metadata = { userId, courseId: dto.courseId, enrollmentId: enrollment.id };
      const paymentIntent = await this.stripePaymentService.paymentIntent({
        totalAmount: totalAmount,
        currency: 'usd',
        metadata,
        customerId: customerId

      });

      enrollment.paymentIntentId = paymentIntent.id;
      await this.enrollmentRepository.save(enrollment);

      return {
        status: true,
        statusCode: 200,
        message: 'Payment Intent Created Successfully',
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentIntent: paymentIntent,
        enrollmentId: enrollment.id,
        pricingDetails: {
          basePrice,
          taxPercentage,
          taxAmount: Number(taxAmount.toFixed(2)),
          totalAmount: Number(totalAmount.toFixed(2)),
        },
      };
    } catch (error: any) {
      console.error('CREATE_PAYMENT_INTENT_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async adminGrantAccess(dto: AdminGrantAccessDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: dto.userId } })
      if (!user) throw new NotFoundException('User not found')

      const course = await this.courseRepository.findOne({ where: { id: dto.courseId, softDel: false } })
      if (!course) throw new BadRequestException('Course not found')

      const enrollment = this.enrollmentRepository.create({
        userId: dto.userId,
        instructorId: course.creatorId,
        planType: PricingOption.FREE,
        courseId: dto.courseId,
        basePrice: 0,
        taxPercentage: 0,
        taxAmount: 0,
        totalAmount: 0,
        paymentMethod: PaymentMethod.ADMINGRANT,
        paymentStatus: PaymentStatus.PAID,
      })

      await this.enrollmentRepository.save(enrollment)

      return {
        status: true,
        statusCode: 200,
        message: 'Course access granted successfully by admin',
        enrollmentId: enrollment.id
      }
    } catch (error: any) {
      console.error('ADMIN_GRANT_ACCESS_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async createStripeSubscription(dto: CreateEnrollmentDto, userId: string) {
    try {
      const { planType } = dto

      const course = await this.courseRepository.findOne({ where: { id: dto.courseId, softDel: false } })
      if (!course) throw new BadRequestException('Course not found')

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) throw new BadRequestException('User not found');

      const selectedPricing = course.pricingOptions?.find((p) => p.option == planType)
      if (!selectedPricing) throw new NotFoundException('Pricing option not found')

      if (!selectedPricing.stripePriceId) throw new BadRequestException('Stripe price id missing for this pricing option')

      const stripe = await (this.stripePaymentService as any).getStripe();

      let customerId = user.stripeCustomerId
      if (!customerId) {
        const customer = await stripe.customers.create({
          metadata: { userId },
          name: user?.fullname,
          email: user?.email,
          description: `Subscription for user ${userId}`
        })

        customerId = customer.id

        await this.userRepository.update(userId, {
          stripeCustomerId: customerId
        })
      }

      const subscription: any = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: selectedPricing.stripePriceId }],
        payment_behavior: 'default_incomplete',
        collection_method: 'charge_automatically',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription'
        },
        metadata: { userId, courseId: dto.courseId ?? null },
        expand: ['latest_invoice.confirmation_secret', 'items.data'],
      });

      console.log("Stripe subscription created:", JSON.stringify(subscription));

      const basePrice = Number(selectedPricing.price);
      const taxRecord = await this.taxRepository.findOneBy({});
      const taxPercentage = taxRecord ? Number(taxRecord.tax) : 0;
      const taxAmount = (basePrice * taxPercentage) / 100;
      const totalAmount = basePrice + taxAmount;

      const enrollment = this.enrollmentRepository.create({
        userId,
        instructorId: course.creatorId,
        courseId: dto.courseId,
        planType,
        basePrice,
        taxPercentage,
        taxAmount,
        totalAmount,
        paymentMethod: PaymentMethod.STRIPE,
        paymentStatus: PaymentStatus.PENDING,
        subscriptionStatus: SubscriptionStatus.Inactive,
        stripeSubscriptionId: subscription.id,
        nextBillingDate: subscription?.items?.data?.[0]?.current_period_end ? new Date(subscription?.items?.data[0]?.current_period_end * 1000) : undefined,
        accessStartDate: new Date(),
        accessEndDate: subscription?.items?.data[0]?.current_period_end ? new Date(subscription?.items?.data[0]?.current_period_end * 1000) : undefined,
        isRenewal: false
      })
      await this.enrollmentRepository.save(enrollment)

      return {
        status: true,
        statusCode: 200,
        message: 'Stripe subscription created successfully',
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.confirmation_secret?.client_secret ?? null,
        enrollmentId: enrollment.id
      }
    } catch (error: any) {
      console.error('CREATE_PAYMENT_INTENT_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkStripePaymentStatus(dto: CheckPaymentStatusDto) {
    try {

      const { paymentIntentId, enrollmentId } = dto;
      if (!paymentIntentId || !enrollmentId)
        throw new InternalServerErrorException('Payment Intent ID and Enrollment ID are required');

      const paymentIntent = await this.stripePaymentService.retrievePaymentIntent(paymentIntentId);

      if (!paymentIntent)
        throw new NotFoundException('Payment Intent not found in Stripe');

      console.log(`PAYMENT STATUS [${paymentIntent.id}] → ${paymentIntent.status}`);

      let status: PaymentStatus = PaymentStatus.PENDING;
      //let paymentStatus = 'succeeded'

      switch (paymentIntent.status) {
        case 'succeeded':
          status = PaymentStatus.PAID;
          break;
        case 'requires_payment_method':
        case 'requires_action':
          status = PaymentStatus.FAILED;
          break;
        case 'canceled':
          status = PaymentStatus.CANCELLED;
          break;
        default:
          status = PaymentStatus.PENDING;
          break;
      }

      const enrollment: any = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });
      if (!enrollment) throw new NotFoundException('Enrollment not found');

      enrollment.paymentStatus = status;
      if (status === PaymentStatus.PAID) {
        enrollment.accessStartDate = new Date();
        if (enrollment.planType === PricingOption.LIFETIME) {
          enrollment.accessEndDate = null;
          enrollment.nextBillingDate = null;
          enrollment.subscriptionStatus = SubscriptionStatus.Active;
        } else {
          enrollment.subscriptionStatus = SubscriptionStatus.Active;
          enrollment.paymentStatus = PaymentStatus.PAID
        }

        const { platformShare, instructorShare } = await this.commissionHelper.getInstructorCommission(enrollment.instructorId)
        const totalAmount = Number(enrollment.totalAmount)

        // split amount
        const instructorAmount = (totalAmount * instructorShare) / 100
        const platformAmount = (totalAmount * platformShare) / 100

        // add paid amount to admin queue
        await this.saleApprovalQueueRepository.save({
          instructorId: enrollment.instructorId,
          courseId: enrollment.courseId,
          buyerId: enrollment.userId,
          instructorAmount: Number(instructorAmount),
          platformAmount: Number(platformAmount),
          soldOn: new Date(),
          status: ApprovalQueueStatus.PENDING

        })

        const [student, instructor, course, admins] =
          await Promise.all([
            this.userRepository.findOne({
              where: { id: enrollment.userId },
            }),
            this.userRepository.findOne({
              where: { id: enrollment.instructorId },
            }),
            this.courseRepository.findOne({
              where: { id: enrollment.courseId },
            }),
            this.adminRepository.find({
              where: { softDel: false },
            }),
          ]);
        if (instructor?.email) {
          await this.mailHelper.sendTemplateMail(
            'INSTRUCTOR_COURSE_PURCHASE',
            instructor.email,
            {
              instructorName: instructor.fullname || 'Instructor',
              courseTitle: course?.title!,
              studentEmail: student?.email!,
              amount: totalAmount,
              purchaseDate: new Date().toDateString(),
            },
          );
        }

        for (const admin of admins) {
          await this.mailHelper.sendTemplateMail(
            'ADMIN_COURSE_PURCHASE_APPROVAL',
            admin.email!,
            {
              courseTitle: course?.title!,
              instructorEmail: instructor?.email!,
              studentName: student?.fullname!,
              studentEmail: student?.email!,
              amount: totalAmount,
            },
          );
        }

      }
      enrollment.updatedAt = new Date();

      const updatedEnrollment = await this.enrollmentRepository.save(enrollment);

      return {
        // id: paymentIntent.id,
        // amount: paymentIntent.amount / 100,
        // currency: paymentIntent.currency,
        // stripeStatus: paymentIntent.status,
        // mappedStatus: status,
        // enrollmentId: enrollment.id,
        // userId: enrollment.userId,
        // courseId: enrollment.courseId,
        // metadata: paymentIntent.metadata,
        status: status == PaymentStatus.PAID,
        statusCode: 200,
        message: `Your payment status is ${status}`,
        data: updatedEnrollment,
      };
    } catch (error: any) {
      console.error('CHECK_PAYMENT_STATUS_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleStripeWebhook(rawBody: Buffer | string, signature: string) {
    let event: Stripe.Event
    try {
      const stripe = await (this.stripePaymentService as any).getStripe();

      const dbSecret = await this.settingsService.getStripeWebhookSecret().catch(() => null);

      const webhookSecret = dbSecret || process.env.STRIPE_WEBHOOK_SECRET;

      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message ?? error);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
    console.log(`✅ Stripe event received: ${event.type} [${event.id}]`);
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSuccess(event.data.object as Stripe.PaymentIntent)
          break

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
          break

        case 'invoice.payment_failed':
          await this.handleInvoicePamentFailed(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break

        default:
          console.log(`Unhandled stripe event type ${event.type}`);
      }
    } catch (error: any) {
      console.error(`❌ Error handling stripe event ${event.type} [${event.id}]:`, error?.message ?? error, error?.stack);
      throw error;
    }
    return ({ received: true })
  }

  async handlePaymentIntentSuccess(paymentIntent: Stripe.PaymentIntent) {

    console.log("paymentIntent", paymentIntent);

    const stripe = await (this.stripePaymentService as any).getStripe();

    const invoiceId = (paymentIntent as any).invoice as string | undefined;
    console.log("invoiceid", invoiceId);


    if (!invoiceId) return;

    const invoice = await stripe.invoices.retrieve(invoiceId);
    console.log("handlePaymentIntentSuccessInvouce", invoice);


    const subscriptionId = invoice?.parent?.subscription_details?.subscription as string;
    console.log("sunscriptionId", subscriptionId);


    if (!subscriptionId) return;

    const enrollment = await this.enrollmentRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId }
    });
    console.log("enrollment", enrollment);


    if (!enrollment) return;

    if (enrollment.paymentStatus === PaymentStatus.PAID) return;

    // set default payment method for customer
    if (paymentIntent.payment_method && paymentIntent.customer) {
      await stripe.customers.update(paymentIntent.customer as string, {
        invoice_settings: {
          default_payment_method: paymentIntent.payment_method as string
        }
      });
    }

    enrollment.paymentStatus = PaymentStatus.PAID;
    enrollment.subscriptionStatus = SubscriptionStatus.Active;
    enrollment.accessStartDate = new Date();

    if (enrollment.planType === PricingOption.LIFETIME)
      enrollment.accessEndDate = undefined;

    await this.enrollmentRepository.save(enrollment);
  }

  async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const enrollmentId = paymentIntent.metadata?.enrollmentId
    if (!enrollmentId) return

    await this.enrollmentRepository.update(enrollmentId, {
      paymentStatus: PaymentStatus.FAILED
    })
  }

  /**
   * Resolves the Stripe subscription id from an Invoice across API shapes.
   * Older API exposed `invoice.subscription`; newer (2025-03-31+) moved it to
   * `invoice.parent.subscription_details.subscription`. Either may be a bare id
   * string or an expanded object.
   */
  private resolveStripeSubscriptionId(invoice: Stripe.Invoice): string | null {
    const raw =
      (invoice as any).subscription ||
      (invoice as any)?.parent?.subscription_details?.subscription ||
      null;
    if (!raw) return null;
    return typeof raw === 'string' ? raw : (raw.id ?? null);
  }

  /**
   * Records a subscription transaction exactly once per gateway invoice.
   * Stripe delivers webhooks at-least-once, so we key on the invoice id to
   * avoid duplicate rows on retries/redeliveries. Returns true if a row was
   * written, false if it already existed.
   */
  private async recordGatewayTransactionOnce(data: {
    gatewayInvoiceId?: string | null;
    enrollment: Enrollment;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    subscriptionStatus: SubscriptionStatus;
    accessStartDate?: Date;
    accessEndDate?: Date;
  }): Promise<boolean> {
    if (data.gatewayInvoiceId) {
      const existing = await this.transactionRepository.findOne({
        where: { gatewayInvoiceId: data.gatewayInvoiceId },
      });
      if (existing) {
        console.log(`↩️ Transaction already recorded for invoice ${data.gatewayInvoiceId}, skipping duplicate.`);
        return false;
      }
    }

    await this.transactionRepository.save({
      userId: data.enrollment.userId,
      enrollmentId: data.enrollment.id,
      courseId: data.enrollment.courseId,
      instructorId: data.enrollment.instructorId,
      gatewayInvoiceId: data.gatewayInvoiceId ?? undefined,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      subscriptionStatus: data.subscriptionStatus,
      accessStartDate: data.accessStartDate,
      accessEndDate: data.accessEndDate,
      planType: data.enrollment.planType,
      createdAt: new Date(),
    });
    return true;
  }

  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = this.resolveStripeSubscriptionId(invoice);
    if (!subscriptionId) {
      console.log('Invoice has no subscription ID, skipping...');
      return;
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!enrollment) {
      console.log(`Enrollment not found for subscription ${subscriptionId}`);
      return;
    }

    console.log(`ℹ️ invoice.payment_succeeded invoice=${invoice.id} amount_paid=${invoice.amount_paid} billing_reason=${invoice.billing_reason}`);

    if (invoice.amount_paid == 0) {
      console.log(`Invoice ${invoice.id} has amount_paid = 0, skipping transaction creation.`);
      return
    }

    // Period end of the line item just paid for → until when access is granted.
    const periodEnd = invoice.lines?.data?.[0]?.period?.end;
    if (!periodEnd) {
      console.warn(`Invoice ${invoice.id} for subscription ${subscriptionId} has no line-item period; retaining existing accessEndDate.`);
    }
    const accessEndDate = periodEnd ? new Date(periodEnd * 1000) : enrollment.accessEndDate;

    enrollment.paymentStatus = PaymentStatus.PAID;
    enrollment.subscriptionStatus = SubscriptionStatus.Active;
    enrollment.accessStartDate = new Date();
    enrollment.accessEndDate = accessEndDate;
    // On a renewal the next billing date advances to this period end.
    if (accessEndDate) enrollment.nextBillingDate = accessEndDate;

    await this.enrollmentRepository.save(enrollment);

    const recorded = await this.recordGatewayTransactionOnce({
      gatewayInvoiceId: invoice.id,
      enrollment,
      paymentMethod: PaymentMethod.STRIPE,
      totalAmount: invoice.amount_paid / 100,
      paymentStatus: PaymentStatus.PAID,
      subscriptionStatus: SubscriptionStatus.Active,
      accessStartDate: enrollment.accessStartDate,
      accessEndDate: enrollment.accessEndDate,
    });

    if (recorded) {
      console.log(`✅ Subscription transaction recorded for enrollment ${enrollment.id}, invoice ${invoice.id}, amount ${invoice.amount_paid / 100}`);
    }
  }

  async handleInvoicePamentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = this.resolveStripeSubscriptionId(invoice);
    if (!subscriptionId) {
      console.log('Invoice has no subscription ID, skipping...');
      return;
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId }
    })

    if (!enrollment) {
      console.log(`Enrollment not found for subscription ${subscriptionId}`);
      return;
    }

    enrollment.paymentStatus = PaymentStatus.FAILED
    enrollment.subscriptionStatus = SubscriptionStatus.PastDue

    const periodEnd = invoice.lines?.data?.[0]?.period?.end
    if (periodEnd) enrollment.accessEndDate = new Date(periodEnd * 1000)

    await this.enrollmentRepository.save(enrollment)

    const recorded = await this.recordGatewayTransactionOnce({
      gatewayInvoiceId: invoice.id,
      enrollment,
      paymentMethod: PaymentMethod.STRIPE,
      totalAmount: (invoice.amount_due ?? 0) / 100,
      paymentStatus: PaymentStatus.FAILED,
      subscriptionStatus: SubscriptionStatus.PastDue,
      accessEndDate: enrollment.accessEndDate,
    });

    if (recorded) {
      console.log(`⚠️ Failed-payment transaction recorded for subscription ${subscriptionId}, invoice ${invoice.id}`);
    }
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    if (!subscription.id) return;

    const enrollment: any = await this.enrollmentRepository.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!enrollment) {
      console.log(`Enrollment not found for subscription ${subscription.id}`);
      return;
    }

    const periodEnd = subscription.items?.data?.[0]?.current_period_end ?? null;

    enrollment.nextBillingDate = periodEnd ? new Date(periodEnd * 1000) : null;
    enrollment.accessEndDate = periodEnd ? new Date(periodEnd * 1000) : null;

    await this.enrollmentRepository.save(enrollment);
  }

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    if (!subscription.id) return;

    const enrollment = await this.enrollmentRepository.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!enrollment) return;

    const cancelAt = subscription.ended_at || subscription.items.data[0].current_period_end || Math.floor(Date.now() / 1000);

    enrollment.accessEndDate = new Date(cancelAt * 1000)
    enrollment.subscriptionStatus = SubscriptionStatus.Cancelled;
    enrollment.paymentStatus = PaymentStatus.CANCELLED
    enrollment.isCancelScheduled = false

    await this.enrollmentRepository.save(enrollment);
  }

  async createRazorpayPayment(dto: CreateEnrollmentDto, userId: string) {
    try {
      console.log('createRazorpayPayment', dto);

      const { planType } = dto;

      const course: any = await this.courseRepository.findOne({
        where: { id: dto.courseId, softDel: false }
      })
      if (!course) throw new NotFoundException('Course not found')

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) throw new NotFoundException('User not found')

      const selectedPricing = course.pricingOptions.find(
        (p: any) => p.option === planType,
      );

      if (!selectedPricing)
        throw new NotFoundException('Selected pricing option not found for course');

      let customerId = user?.razorpayCustomerId
      if (!customerId) {
        customerId = await this.razorpayPaymentService.createCustomer(
          user?.fullname || 'User',
          user?.email || '',
          user?.phoneNumber
        )
        await this.userRepository.update(userId, { razorpayCustomerId: customerId });
      }

      const basePrice = Number(selectedPricing.price);

      const res = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD')
      const data = await res.json()
      const rate = parseFloat(data?.data?.rates?.['INR']);
      if (!rate) throw new InternalServerErrorException('Failed to fetch USD to INR rate');

      const taxRecord = await this.taxRepository.findOneBy({});
      const taxPercentage = taxRecord ? Number(taxRecord.tax) : 0; // tax
      const taxAmount = (basePrice * taxPercentage) / 100;
      const totalAmount = basePrice + taxAmount

      const totalAmountInINR = Math.round(totalAmount * rate) //INR

      const enrollment = this.enrollmentRepository.create({
        userId,
        instructorId: course.creatorId,
        courseId: dto.courseId,
        planType,
        basePrice,
        taxPercentage,
        taxAmount,
        totalAmount,
        paymentMethod: PaymentMethod.RAZORPAY,
        paymentStatus: PaymentStatus.PENDING,
      });
      await this.enrollmentRepository.save(enrollment)

      // create razorpay order
      const metadata = { userId, courseId: dto.courseId || '', enrollmentId: enrollment.id || '' };
      const order = await this.razorpayPaymentService.createOrder({
        totalAmount: totalAmountInINR,
        currency: 'INR',
        receipt: `rcpt_${uuidv4().replace(/-/g, '').slice(0, 20)}`,
        metadata
      })
      console.log('Razorpay_order', order);

      enrollment.razorpayOrderId = order.id
      await this.enrollmentRepository.save(enrollment)

      return {
        status: true,
        statusCode: 200,
        message: 'Razorpay order created successfully',
        orderId: order.id,
        enrollmentId: enrollment.id,
        pricingDetails: {
          basePrice,
          taxPercentage,
          taxAmount: Number(taxAmount.toFixed(2)),
          totalAmount: Number(totalAmount.toFixed(2)),
          totalAmountInINR,
          currency: 'INR'
        },
      }
    } catch (error: any) {
      console.error('Get Course Error', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async createRazorpaySubscription(dto: CreateEnrollmentDto, userId: string) {
    try {
      const { planType } = dto

      const course = await this.courseRepository.findOne({ where: { id: dto.courseId, softDel: false } })
      if (!course) throw new BadRequestException('Course not found')

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) throw new BadRequestException('User not found');


      const selectedPricing = course.pricingOptions?.find((p) => p.option == planType)
      if (!selectedPricing) throw new NotFoundException('Pricing option not found')

      if (!selectedPricing.razorpayPlanId)
        throw new BadRequestException(
          'Razorpay plan ID missing for this pricing option. Create a plan first.',
        );

      let customerId = user.razorpayCustomerId
      if (!customerId) {
        customerId = await this.razorpayPaymentService.createCustomer(
          user?.fullname || 'User',
          user?.email || '',
          user?.phoneNumber
        )
        await this.userRepository.update(userId, { razorpayCustomerId: customerId });
      }

      // Determine billing cycles by plan
      const totalCount = planType === PricingOption.ONE_MONTH
        ? 12        // allow up to 12 monthly renewals
        : planType === PricingOption.SIX_MONTHS
          ? 4         // 4 × 6-month cycles
          : planType === PricingOption.ONE_YEAR
            ? 5         // 5 annual cycles
            : 9999;     // indefinite

      const subscription = await this.razorpayPaymentService.createSubscription({
        planId: selectedPricing.razorpayPlanId,
        totalCount,
        customerId,
        metadata: { userId, courseId: dto.courseId ?? '' }
      })

      console.log("Razorpay subscription created:", JSON.stringify(subscription));


      const basePrice = Number(selectedPricing.price);
      const taxRecord = await this.taxRepository.findOneBy({});
      const taxPercentage = taxRecord ? Number(taxRecord.tax) : 0; // tax
      const taxAmount = (basePrice * taxPercentage) / 100;
      const totalAmount = basePrice + taxAmount;

      // charge_at is the next billing unix timestamp from Razorpay
      const nextBilling = (subscription as any).charge_at
        ? new Date((subscription as any).charge_at * 1000)
        : undefined;

      const enrollment = this.enrollmentRepository.create({
        userId,
        instructorId: course.creatorId,
        courseId: dto.courseId,
        planType,
        basePrice,
        taxPercentage,
        taxAmount,
        totalAmount,
        paymentMethod: PaymentMethod.RAZORPAY,
        paymentStatus: PaymentStatus.PENDING,
        subscriptionStatus: SubscriptionStatus.Inactive,
        razorpaySubscriptionId: subscription.id,
        nextBillingDate: nextBilling,
        accessStartDate: new Date(),
        accessEndDate: nextBilling,
        isRenewal: false
      })
      await this.enrollmentRepository.save(enrollment)

      return {
        status: true,
        statusCode: 200,
        message: 'Razorpay subscription created successfully',
        subscriptionId: subscription.id,
        shortUrl: (subscription as any).short_url ?? null,
        enrollmentId: enrollment.id
      }

    } catch (error: any) {
      console.error('RAZORPAY_CREATE_SUBSCRIPTION_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkRazorpayPaymentStatus(dto: CheckRazorpayPaymentDto) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, enrollmentId } = dto;
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !enrollmentId) throw new BadRequestException('orderId, paymentId, signature and enrollmentId are required');

      const enrollment: any = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } })
      if (!enrollment) throw new NotFoundException('Enrollment not found')

      // fetch webhhook secret
      const settings = await this.settingsService.getSettings()

      const secret = settings?.data.razorpayKeySecret
      if (!secret) throw new BadRequestException('Razorpay key secret is not configured');

      const isValid = this.razorpayPaymentService.verifyPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        secret
      })

      if (!isValid) {
        enrollment.paymentStatus = PaymentStatus.FAILED
        await this.enrollmentRepository.save(enrollment)
        throw new BadRequestException('Payment signature verification failed');
      }

      enrollment.paymentStatus = PaymentStatus.PAID;
      enrollment.razorpayPaymentId = razorpayPaymentId;
      enrollment.accessStartDate = new Date();
      enrollment.subscriptionStatus = SubscriptionStatus.Active;

      if (enrollment.planType == PricingOption.LIFETIME) {
        enrollment.accessEndDate = null
        enrollment.nextBillingDate = null
      }

      const { platformShare, instructorShare } = await this.commissionHelper.getInstructorCommission(enrollment.instructorId)
      const totalAmount = Number(enrollment.totalAmount)

      // split amount
      const instructorAmount = (totalAmount * instructorShare) / 100
      const platformAmount = (totalAmount * platformShare) / 100

      await this.saleApprovalQueueRepository.save({
        instructorId: enrollment.instructorId,
        courseId: enrollment.courseId,
        buyerId: enrollment.userId,
        instructorAmount: Number(instructorAmount),
        platformAmount: Number(platformAmount),
        soldOn: new Date(),
        status: ApprovalQueueStatus.PENDING
      })

      const [student, instructor, course, admins] =
        await Promise.all([
          this.userRepository.findOne({
            where: { id: enrollment.userId },
          }),
          this.userRepository.findOne({
            where: { id: enrollment.instructorId },
          }),
          this.courseRepository.findOne({
            where: { id: enrollment.courseId },
          }),
          this.adminRepository.find({
            where: { softDel: false },
          }),
        ]);
      if (instructor?.email) {
        await this.mailHelper.sendTemplateMail(
          'INSTRUCTOR_COURSE_PURCHASE',
          instructor.email,
          {
            instructorName: instructor.fullname || 'Instructor',
            courseTitle: course?.title!,
            studentEmail: student?.email!,
            amount: totalAmount,
            purchaseDate: new Date().toDateString(),
          },
        );
      }

      for (const admin of admins) {
        await this.mailHelper.sendTemplateMail(
          'ADMIN_COURSE_PURCHASE_APPROVAL',
          admin.email!,
          {
            courseTitle: course?.title!,
            instructorEmail: instructor?.email!,
            studentName: student?.fullname!,
            studentEmail: student?.email!,
            amount: totalAmount,
          },
        );
      }

      const updatedEnrollment = await this.enrollmentRepository.save(enrollment)

      return {
        status: true,
        statusCode: 200,
        message: 'Payment verified and enrollment activated',
        data: updatedEnrollment,
      }
    } catch (error: any) {
      console.error('CHECK_PAYMENT_STATUS_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleRazorpayWebhook(rawBody: Buffer | string, signature: string) {
    const bodyString = typeof rawBody == 'string' ? rawBody : rawBody.toString('utf-8')
    const settings = await this.settingsService.getSettings()
    const webhookSecret = settings?.data?.razorpayWebhookSecret ?? process.env.RAZORPAY_WEBHOOK_SECRET ?? ''

    const isValid = this.razorpayPaymentService.verifyWebhookSignature(bodyString, signature, webhookSecret)
    if (!isValid) {
      console.error('Razorpay webhook signature mismatch');
      throw new BadRequestException('Webhook signature verification failed');
    }
    let event: any
    try {
      event = JSON.parse(bodyString)
      console.log("Razorpay_Event", event);

    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message ?? error);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
    console.log('✅ Razorpay event received:', event.event);
    try {
      switch (event.event) {
        case 'payment.captured':
          await this.handleRazorpayPaymentCaptured(event.payload.payment.entity)
          break

        case 'payment.failed':
          await this.handleRazorpayPaymentFailed(event.payload.payment.entity);
          break;

        case 'subscription.charged':
          await this.handleRazorpaySubscriptionCharged(
            event.payload.subscription?.entity,
            event.payload.payment?.entity,
          );
          break;

        case 'subscription.pending':
        case 'subscription.halted':
          await this.handleRazorpaySubscriptionFailed(event.payload.subscription.entity);
          break;


        case 'subscription.cancelled':
          await this.handleRazorpaySubscriptionCancelled(event.payload.subscription.entity);
          break;

        default:
          console.log(`Unhandled Razorpay event: ${event.event}`);
      }
    } catch (error: any) {
      console.error(`❌ Razorpay webhook handler error [${event.event}]:`, error?.message ?? error);
    }
    return { received: true }
  }

  async handleRazorpayPaymentCaptured(payment: any) {
    console.log("Razorpay payment captured:", payment);
    const enrollmentId = payment.notes?.enrollmentId;
    if (!enrollmentId) return;

    const enrollment: any = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
    });
    if (!enrollment) return;
    if (enrollment.paymentStatus === PaymentStatus.PAID) return;

    enrollment.paymentStatus = PaymentStatus.PAID;
    enrollment.subscriptionStatus = SubscriptionStatus.Active;
    enrollment.accessStartDate = new Date();
    enrollment.razorpayPaymentId = payment.id;

    if (enrollment.planType === PricingOption.LIFETIME) {
      enrollment.accessEndDate = null;
      enrollment.nextBillingDate = null;
    }

    await this.enrollmentRepository.save(enrollment);
    console.log(`✅ Razorpay payment captured for enrollment ${enrollmentId}`);
  }

  async handleRazorpayPaymentFailed(payment: any) {
    console.log("Razorpay payment failed:", payment);
    const enrollmentId = payment.notes?.enrollmentId;
    if (!enrollmentId) return;

    await this.enrollmentRepository.update(enrollmentId, {
      paymentStatus: PaymentStatus.FAILED,
    });
    console.log(`⚠️ Razorpay payment failed for enrollment ${enrollmentId}`);
  }

  async handleRazorpaySubscriptionCharged(subscription: any, payment?: any) {
    console.log("Razorpay subscription charged:", subscription);
    const enrollment = await this.enrollmentRepository.findOne({
      where: { razorpaySubscriptionId: subscription.id },
    });
    if (!enrollment) {
      console.log(`Enrollment not found for subscription ${subscription.id}`);
      return;
    }

    if (payment && payment?.amount == 0) return

    // current_end is the end of the period just paid for

    const periodEnd = subscription.current_end ? new Date(subscription.current_end * 1000) : undefined;
    if (enrollment.paymentStatus == PaymentStatus.PAID && periodEnd && enrollment.accessEndDate && new Date(enrollment.accessEndDate).getTime() >= periodEnd.getTime()) {
      console.log(`⚠️ Already processed subscription.charged for ${subscription.id}, skipping.`);
      return;
    }

    const nextBilling = subscription.charge_at ? new Date(subscription.charge_at * 1000) : undefined;

    const accessStartDate = new Date()

    await this.enrollmentRepository.update(
      { id: enrollment.id },
      {
        paymentStatus: PaymentStatus.PAID,
        subscriptionStatus: SubscriptionStatus.Active,
        accessStartDate,
        accessEndDate: periodEnd,
        nextBillingDate: nextBilling
      }
    )
    // enrollment.paymentStatus = PaymentStatus.PAID;
    // enrollment.subscriptionStatus = SubscriptionStatus.Active;
    // enrollment.accessStartDate = new Date();
    // enrollment.accessEndDate = periodEnd;
    // enrollment.nextBillingDate = nextBilling;

    // await this.enrollmentRepository.save(enrollment);

    const { platformShare, instructorShare } = await this.commissionHelper.getInstructorCommission(enrollment.instructorId)
    const totalAmount = Number(enrollment.totalAmount)

    // split amount
    const instructorAmount = (totalAmount * instructorShare) / 100
    const platformAmount = (totalAmount * platformShare) / 100

    await this.saleApprovalQueueRepository.save({
      instructorId: enrollment.instructorId,
      courseId: enrollment.courseId,
      buyerId: enrollment.userId,
      instructorAmount: Number(instructorAmount),
      platformAmount: Number(platformAmount),
      soldOn: new Date(),
      status: ApprovalQueueStatus.PENDING
    })

    // Save transaction record
    await this.transactionRepository.save({
      userId: enrollment.userId,
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      instructorId: enrollment.instructorId,
      totalAmount: Number(enrollment.totalAmount),
      paymentMethod: PaymentMethod.RAZORPAY,
      paymentStatus: PaymentStatus.PAID,
      subscriptionStatus: SubscriptionStatus.Active,
      accessStartDate,
      accessEndDate: periodEnd,
      planType: enrollment.planType,
      createdAt: new Date(),
    });
    console.log(`✅ Razorpay subscription charged processed: ${subscription.id}`);
  }

  async handleRazorpaySubscriptionFailed(subscription: any) {
    console.log("Razorpay subscription failed:", subscription);
    const enrollment = await this.enrollmentRepository.findOne({
      where: { razorpaySubscriptionId: subscription.id },
    });
    if (!enrollment) {
      console.log("❌ Enrollment not found for subscription:", subscription.id);
      return;
    }

    const now = new Date()

    const accessEndDate: any = subscription.current_end ? new Date(subscription.current_end * 1000) : enrollment.accessEndDate ?? null;


    await this.transactionRepository.save({
      userId: enrollment.userId,
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      instructorId: enrollment.instructorId,
      totalAmount: Number(enrollment.totalAmount),
      paymentMethod: PaymentMethod.RAZORPAY,
      paymentStatus: PaymentStatus.FAILED,
      subscriptionStatus: SubscriptionStatus.PastDue,
      accessEndDate: accessEndDate ?? undefined,
      planType: enrollment.planType,
      createdAt: new Date(),
    });

    if (accessEndDate && now < accessEndDate) {
      await this.enrollmentRepository.update(
        { id: enrollment.id },
        {
          subscriptionStatus: SubscriptionStatus.PastDue,
          accessEndDate
        }
      )
      console.log(
        `🟡 Payment failed but access still active until ${accessEndDate}`
      );
    } else {
      await this.enrollmentRepository.update(
        { id: enrollment.id },
        {
          paymentStatus: PaymentStatus.FAILED,
          subscriptionStatus: SubscriptionStatus.Inactive,
          accessEndDate: accessEndDate ?? undefined

        }
      )
      console.log(
        `🔴 Access expired. Subscription halted for enrollment ${enrollment.id}`
      );
    }

    // enrollment.paymentStatus = PaymentStatus.FAILED;
    // enrollment.subscriptionStatus = SubscriptionStatus.PastDue;

    // if (subscription.current_end) {
    //   enrollment.accessEndDate = new Date(subscription.current_end * 1000);
    // }

    // await this.enrollmentRepository.save(enrollment);

    console.log(`⚠️ Razorpay subscription payment failed: ${subscription.id}`);
  }

  async handleRazorpaySubscriptionCancelled(subscription: any) {
    console.log("Razorpay subscription cancelled:", subscription);
    const enrollment = await this.enrollmentRepository.findOne({
      where: { razorpaySubscriptionId: subscription.id },
    });
    if (!enrollment) return;

    const cancelAt =
      subscription.ended_at ??
      subscription.current_end ??
      Math.floor(Date.now() / 1000);

    enrollment.accessEndDate = new Date(cancelAt * 1000);
    enrollment.subscriptionStatus = SubscriptionStatus.Cancelled;
    enrollment.paymentStatus = PaymentStatus.CANCELLED;
    enrollment.isCancelScheduled = false;

    await this.enrollmentRepository.save(enrollment);
    console.log(`🚫 Razorpay subscription cancelled: ${subscription.id}`);
  }

  // ==================== PAYPAL ====================

  private findPaypalApproveUrl(resource: any): string | null {
    const link = (resource?.links ?? []).find((l: any) => l.rel === 'approve' || l.rel === 'payer-action');
    return link?.href ?? null;
  }

  // One-time PayPal order (e.g. LIFETIME / single payment)
  async createPaypalPayment(dto: CreateEnrollmentDto, userId: string) {
    try {
      const { planType } = dto;

      const course: any = await this.courseRepository.findOne({ where: { id: dto.courseId, softDel: false } });
      if (!course) throw new NotFoundException('Course not found');

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const selectedPricing = course.pricingOptions.find((p: any) => p.option === planType);
      if (!selectedPricing) throw new NotFoundException('Selected pricing option not found for course');

      const basePrice = Number(selectedPricing.price);
      const taxRecord = await this.taxRepository.findOneBy({});
      const taxPercentage = taxRecord ? Number(taxRecord.tax) : 0;
      const taxAmount = (basePrice * taxPercentage) / 100;
      const totalAmount = basePrice + taxAmount;

      const enrollment = this.enrollmentRepository.create({
        userId,
        instructorId: course.creatorId,
        courseId: dto.courseId,
        planType,
        basePrice,
        taxPercentage,
        taxAmount,
        totalAmount,
        paymentMethod: PaymentMethod.PAYPAL,
        paymentStatus: PaymentStatus.PENDING,
      });
      await this.enrollmentRepository.save(enrollment);

      const order: any = await this.paypalPaymentService.createOrder({
        totalAmount: Number(totalAmount.toFixed(2)),
        currency: 'USD',
        enrollmentId: enrollment.id,
      });

      enrollment.paypalOrderId = order.id;
      await this.enrollmentRepository.save(enrollment);

      return {
        status: true,
        statusCode: 200,
        message: 'PayPal order created successfully',
        orderId: order.id,
        approveUrl: this.findPaypalApproveUrl(order),
        enrollmentId: enrollment.id,
        pricingDetails: {
          basePrice,
          taxPercentage,
          taxAmount: Number(taxAmount.toFixed(2)),
          totalAmount: Number(totalAmount.toFixed(2)),
          currency: 'USD',
        },
      };
    } catch (error: any) {
      console.error('CREATE_PAYPAL_ORDER_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async createPaypalSubscription(dto: CreateEnrollmentDto, userId: string) {
    try {
      const { planType } = dto;

      const course = await this.courseRepository.findOne({ where: { id: dto.courseId, softDel: false } });
      if (!course) throw new BadRequestException('Course not found');

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new BadRequestException('User not found');

      const selectedPricing = course.pricingOptions?.find((p) => p.option == planType);
      if (!selectedPricing) throw new NotFoundException('Pricing option not found');

      if (!selectedPricing.paypalPlanId)
        throw new BadRequestException('PayPal plan ID missing for this pricing option. Create a plan first.');

      const basePrice = Number(selectedPricing.price);
      const taxRecord = await this.taxRepository.findOneBy({});
      const taxPercentage = taxRecord ? Number(taxRecord.tax) : 0;
      const taxAmount = (basePrice * taxPercentage) / 100;
      const totalAmount = basePrice + taxAmount;

      const enrollment = this.enrollmentRepository.create({
        userId,
        instructorId: course.creatorId,
        courseId: dto.courseId,
        planType,
        basePrice,
        taxPercentage,
        taxAmount,
        totalAmount,
        paymentMethod: PaymentMethod.PAYPAL,
        paymentStatus: PaymentStatus.PENDING,
        subscriptionStatus: SubscriptionStatus.Inactive,
        accessStartDate: new Date(),
        isRenewal: false,
      });
      await this.enrollmentRepository.save(enrollment);

      const subscription: any = await this.paypalPaymentService.createSubscription({
        planId: selectedPricing.paypalPlanId,
        enrollmentId: enrollment.id,
      });

      enrollment.paypalSubscriptionId = subscription.id;
      await this.enrollmentRepository.save(enrollment);

      return {
        status: true,
        statusCode: 200,
        message: 'PayPal subscription created successfully',
        subscriptionId: subscription.id,
        approveUrl: this.findPaypalApproveUrl(subscription),
        enrollmentId: enrollment.id,
      };
    } catch (error: any) {
      console.error('PAYPAL_CREATE_SUBSCRIPTION_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  // Capture a one-time PayPal order after the buyer approves it on the frontend
  async checkPaypalPaymentStatus(dto: CheckPaypalPaymentDto) {
    try {
      const { paypalOrderId, enrollmentId } = dto;
      if (!paypalOrderId || !enrollmentId) throw new BadRequestException('paypalOrderId and enrollmentId are required');

      const enrollment: any = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });
      if (!enrollment) throw new NotFoundException('Enrollment not found');

      const capture: any = await this.paypalPaymentService.captureOrder(paypalOrderId);

      if (capture?.status !== 'COMPLETED') {
        enrollment.paymentStatus = PaymentStatus.FAILED;
        await this.enrollmentRepository.save(enrollment);
        throw new BadRequestException(`PayPal payment not completed (status: ${capture?.status})`);
      }

      const captureId = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;

      enrollment.paymentStatus = PaymentStatus.PAID;
      enrollment.accessStartDate = new Date();
      enrollment.subscriptionStatus = SubscriptionStatus.Active;

      if (enrollment.planType == PricingOption.LIFETIME) {
        enrollment.accessEndDate = null;
        enrollment.nextBillingDate = null;
      }

      await this.enrollmentRepository.save(enrollment);

      await this.settleSaleAndNotify(enrollment);

      await this.recordGatewayTransactionOnce({
        gatewayInvoiceId: captureId,
        enrollment,
        paymentMethod: PaymentMethod.PAYPAL,
        totalAmount: Number(enrollment.totalAmount),
        paymentStatus: PaymentStatus.PAID,
        subscriptionStatus: SubscriptionStatus.Active,
        accessStartDate: enrollment.accessStartDate,
        accessEndDate: enrollment.accessEndDate,
      });

      return {
        status: true,
        statusCode: 200,
        message: 'Payment verified and enrollment activated',
        data: enrollment,
      };
    } catch (error: any) {
      console.error('CHECK_PAYPAL_PAYMENT_STATUS_ERROR:', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async handlePaypalWebhook(headers: Record<string, any>, body: any) {
    const isValid = await this.paypalPaymentService.verifyWebhookSignature(headers, body);
    if (!isValid) {
      console.error('PayPal webhook signature verification failed');
      throw new BadRequestException('Webhook signature verification failed');
    }

    console.log('✅ PayPal event received:', body?.event_type);
    try {
      switch (body.event_type) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await this.handlePaypalSubscriptionActivated(body.resource);
          break;

        case 'PAYMENT.SALE.COMPLETED':
          await this.handlePaypalSaleCompleted(body.resource);
          break;

        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
          await this.handlePaypalSubscriptionPaymentFailed(body.resource);
          break;

        case 'BILLING.SUBSCRIPTION.CANCELLED':
        case 'BILLING.SUBSCRIPTION.EXPIRED':
          await this.handlePaypalSubscriptionCancelled(body.resource);
          break;

        default:
          console.log(`Unhandled PayPal event: ${body.event_type}`);
      }
    } catch (error: any) {
      console.error(`❌ PayPal webhook handler error [${body?.event_type}]:`, error?.message ?? error);
    }
    return { received: true };
  }

  private async handlePaypalSubscriptionActivated(resource: any) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { paypalSubscriptionId: resource.id },
    });
    if (!enrollment) {
      console.log(`Enrollment not found for PayPal subscription ${resource.id}`);
      return;
    }

    enrollment.subscriptionStatus = SubscriptionStatus.Active;
    if (enrollment.paymentStatus !== PaymentStatus.PAID) enrollment.paymentStatus = PaymentStatus.PAID;
    enrollment.accessStartDate = enrollment.accessStartDate ?? new Date();
    await this.enrollmentRepository.save(enrollment);
    console.log(`✅ PayPal subscription activated: ${resource.id}`);
  }

  // Fired for the initial subscription payment AND every renewal
  private async handlePaypalSaleCompleted(sale: any) {
    const subscriptionId = sale?.billing_agreement_id;
    if (!subscriptionId) {
      console.log('PayPal sale has no billing_agreement_id, skipping...');
      return;
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { paypalSubscriptionId: subscriptionId },
    });
    if (!enrollment) {
      console.log(`Enrollment not found for PayPal subscription ${subscriptionId}`);
      return;
    }

    const amount = Number(sale?.amount?.total ?? enrollment.totalAmount);

    // Fetch current period end so access reflects the cycle just paid for
    let accessEndDate = enrollment.accessEndDate;
    try {
      const subscription: any = await this.paypalPaymentService.getSubscription(subscriptionId);
      const nextTime = subscription?.billing_info?.next_billing_time;
      if (nextTime) accessEndDate = new Date(nextTime);
    } catch (e) {
      console.warn(`Could not fetch PayPal subscription ${subscriptionId} for period end.`);
    }

    enrollment.paymentStatus = PaymentStatus.PAID;
    enrollment.subscriptionStatus = SubscriptionStatus.Active;
    enrollment.accessStartDate = new Date();
    enrollment.accessEndDate = accessEndDate;
    if (accessEndDate) enrollment.nextBillingDate = accessEndDate;
    await this.enrollmentRepository.save(enrollment);

    await this.settleSaleAndNotify(enrollment);

    const recorded = await this.recordGatewayTransactionOnce({
      gatewayInvoiceId: sale?.id,
      enrollment,
      paymentMethod: PaymentMethod.PAYPAL,
      totalAmount: amount,
      paymentStatus: PaymentStatus.PAID,
      subscriptionStatus: SubscriptionStatus.Active,
      accessStartDate: enrollment.accessStartDate,
      accessEndDate: enrollment.accessEndDate,
    });

    if (recorded) {
      console.log(`✅ PayPal subscription payment recorded for enrollment ${enrollment.id}, sale ${sale?.id}, amount ${amount}`);
    }
  }

  private async handlePaypalSubscriptionPaymentFailed(resource: any) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { paypalSubscriptionId: resource.id },
    });
    if (!enrollment) return;

    enrollment.paymentStatus = PaymentStatus.FAILED;
    enrollment.subscriptionStatus = SubscriptionStatus.PastDue;
    await this.enrollmentRepository.save(enrollment);
    console.log(`⚠️ PayPal subscription payment failed: ${resource.id}`);
  }

  private async handlePaypalSubscriptionCancelled(resource: any) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { paypalSubscriptionId: resource.id },
    });
    if (!enrollment) return;

    enrollment.subscriptionStatus = SubscriptionStatus.Cancelled;
    enrollment.paymentStatus = PaymentStatus.CANCELLED;
    enrollment.isCancelScheduled = false;
    await this.enrollmentRepository.save(enrollment);
    console.log(`🚫 PayPal subscription cancelled: ${resource.id}`);
  }

  // Shared: queue instructor/platform split and send purchase notifications
  private async settleSaleAndNotify(enrollment: any) {
    const { platformShare, instructorShare } = await this.commissionHelper.getInstructorCommission(enrollment.instructorId);
    const totalAmount = Number(enrollment.totalAmount);

    const instructorAmount = (totalAmount * instructorShare) / 100;
    const platformAmount = (totalAmount * platformShare) / 100;

    await this.saleApprovalQueueRepository.save({
      instructorId: enrollment.instructorId,
      courseId: enrollment.courseId,
      buyerId: enrollment.userId,
      instructorAmount: Number(instructorAmount),
      platformAmount: Number(platformAmount),
      soldOn: new Date(),
      status: ApprovalQueueStatus.PENDING,
    });

    const [student, instructor, course, admins] = await Promise.all([
      this.userRepository.findOne({ where: { id: enrollment.userId } }),
      this.userRepository.findOne({ where: { id: enrollment.instructorId } }),
      this.courseRepository.findOne({ where: { id: enrollment.courseId } }),
      this.adminRepository.find({ where: { softDel: false } }),
    ]);

    if (instructor?.email) {
      await this.mailHelper.sendTemplateMail('INSTRUCTOR_COURSE_PURCHASE', instructor.email, {
        instructorName: instructor.fullname || 'Instructor',
        courseTitle: course?.title!,
        studentEmail: student?.email!,
        amount: totalAmount,
        purchaseDate: new Date().toDateString(),
      });
    }

    for (const admin of admins) {
      await this.mailHelper.sendTemplateMail('ADMIN_COURSE_PURCHASE_APPROVAL', admin.email!, {
        courseTitle: course?.title!,
        instructorEmail: instructor?.email!,
        studentName: student?.fullname!,
        studentEmail: student?.email!,
        amount: totalAmount,
      });
    }
  }

  async cancelSubscription(enrollmentId: string) {
    try {
      const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } })
      if (!enrollment) throw new BadRequestException('Enrollment not found');

      // stripe
      if (enrollment.stripeSubscriptionId) {
        const stripe = await (this.stripePaymentService as any).getStripe();

        const subscription = await stripe.subscriptions.update(enrollment.stripeSubscriptionId, { cancel_at_period_end: true })

        const periodEnd = subscription.items.data[0].current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000) : enrollment.accessEndDate

        enrollment.subscriptionStatus = SubscriptionStatus.Active
        enrollment.isCancelScheduled = true
        enrollment.accessEndDate = periodEnd
        enrollment.nextBillingDate = undefined

        await this.enrollmentRepository.save(enrollment)

        return {
          status: true,
          statusCode: 200,
          message: 'Subscription Cancelled Successfully. Access continues until end of billing period.',
          accessEndOn: periodEnd
        };
      }

      // razorpay
      if (enrollment.razorpaySubscriptionId) {
        const subscription = await this.razorpayPaymentService.cancelSubscription(enrollment.razorpaySubscriptionId, true)

        const periodEnd = subscription.current_end ? new Date(subscription.current_end * 1000) : enrollment.accessEndDate

        enrollment.subscriptionStatus = SubscriptionStatus.Active
        enrollment.isCancelScheduled = true;
        enrollment.accessEndDate = periodEnd;
        enrollment.nextBillingDate = undefined;

        await this.enrollmentRepository.save(enrollment)

        return {
          status: true,
          statusCode: 200,
          message: 'Subscription cancelled successfully. Access continues until end of billing period.',
          accessEndOn: periodEnd,
        }
      }

      // paypal
      if (enrollment.paypalSubscriptionId) {
        await this.paypalPaymentService.cancelSubscription(enrollment.paypalSubscriptionId)

        // PayPal cancels immediately; access continues until the already-paid period end.
        enrollment.subscriptionStatus = SubscriptionStatus.Active
        enrollment.isCancelScheduled = true
        enrollment.nextBillingDate = undefined

        await this.enrollmentRepository.save(enrollment)

        return {
          status: true,
          statusCode: 200,
          message: 'Subscription cancelled successfully. Access continues until end of billing period.',
          accessEndOn: enrollment.accessEndDate,
        }
      }

      throw new BadRequestException('No active subscription found for this enrollment');

    } catch (error: any) {
      console.error('Get Course Error', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async getMyCourses(paginationDto: PaginationDto, userId: string, filter?: string) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const skip = (page - 1) * limit;
      const now = new Date();

      const whereClause: any = {
        userId,
        paymentStatus: PaymentStatus.PAID,
        softDel: false,
      };

      if (filter === 'Active') {
        whereClause.subscriptionStatus = In([SubscriptionStatus.Active, SubscriptionStatus.PastDue])
      } else if (filter === 'Inactive') {
        whereClause.subscriptionStatus = In([SubscriptionStatus.Cancelled, SubscriptionStatus.Inactive]);
      } else if (filter === 'Lifetime') {
        whereClause.planType = PricingOption.LIFETIME;
      }

      const [enrollments, total] = await this.enrollmentRepository.findAndCount({
        where: whereClause,
        order: { accessStartDate: 'DESC' },
        skip,
        take: limit,
      });

      if (!enrollments.length) return { total, data: [] };

      const courseIds = enrollments.map(e => e.courseId);
      const courses = await this.courseRepository.findBy({
        id: In(courseIds),
        softDel: false,
      });

      const data = enrollments.map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        return {
          enrollmentId: enrollment.id,
          courseId: course?.id,
          title: course?.title,
          courseModules: course?.curriculum,
          modules: course?.curriculum?.length ?? 0,
          status: course?.status,
          courseAvailability: course?.courseAvailability,
          progressPercentage: enrollment.progressPercentage ?? 0,
          subscriptionStatus: enrollment.subscriptionStatus,
          planType: enrollment.planType,
          paymentMethod: enrollment.paymentMethod,
          isCancelScheduled: enrollment.isCancelScheduled,
          accessEndDate:
            enrollment.planType === PricingOption.LIFETIME
              ? null
              : enrollment.accessEndDate,
        };
      });

      return {
        status: true,
        statusCode: 200,
        message: 'Courses fetched successfully',
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        data,
      };
    } catch (error: any) {
      console.error('Get Course Error', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async getInstructorEnrollments(pagination: PaginationDto, instructorId: string, courseId?: string) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = { instructorId, softDel: false };
      if (courseId) filter.courseId = courseId;

      const [enrollments, total] = await Promise.all([
        this.enrollmentRepository.find({
          where: filter,
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
        }),
        this.enrollmentRepository.count({ where: filter }),
      ]);

      if (!enrollments.length) {
        return {
          total: 0,
          page,
          limit,
          totalPages: 0,
          data: [],
        };
      }

      const courseIds = [...new Set(enrollments.map((e) => e.courseId))];
      const userIds = [...new Set(enrollments.map((e) => e.userId))];

      const [courses, users] = await Promise.all([
        this.courseRepository.find({ where: { id: In(courseIds) }, select: ['id', 'title'] }),
        this.userRepository.find({ where: { id: In(userIds) }, select: ['id', 'fullname', 'email'] }),
      ]);

      const courseMap = new Map(courses.map((c) => [c.id, c.title]));
      const userMap = new Map(users.map((u) => [u.id, { name: u.fullname, email: u.email }]));

      // Format for table display
      const data = enrollments.map((e) => ({
        courseTitle: courseMap.get(e.courseId) || 'Unknown Course',
        studentName: userMap.get(e.userId)?.name || 'Unknown Student',
        studentEmail: userMap.get(e.userId)?.email || 'N/A',
        planType: e.planType,
        totalAmount: e.totalAmount,
        paymentStatus: e.paymentStatus,
        enrolledAt: e.createdAt,
        accessEndDate: e.accessEndDate,
      }));

      return {
        status: true,
        statusCode: 200,
        message: 'Enrollments fetched successfully',
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data,
      };
    } catch (error: any) {
      console.error('Get Enrollments Error', error?.message ?? error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPurchasedCourse(enrollmentId: string, userId: string, search?: string) {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: {
          id: enrollmentId,
          userId,
          paymentStatus: PaymentStatus.PAID,
          softDel: false,
        },
      });

      if (!enrollment)
        throw new NotFoundException('Enrollment not found or not authorized.');

      const course = await this.courseRepository.findOne({
        where: { id: enrollment.courseId, softDel: false, /* status: Status.PUBLISHED */ },
      });

      if (!course) throw new NotFoundException('Course not found');

      const instructor = await this.userRepository.findOne({
        where: { id: enrollment.instructorId },
      });

      const regex = search ? new RegExp(search, 'i') : null;
      const curriculum = (course.curriculum || [])
        .map(module => {
          const lectures = module.lectures
            .map(lec => ({
              ...lec,
              isCompleted: enrollment.completedLectures?.includes(lec.id!),
            }))
            .filter(lec => (regex ? regex.test(lec.title) : true));

          return {
            ...module,
            lectures,
          };
        })

        .filter(module => module.lectures.length > 0);

      const totalLectures =
        course.curriculum?.reduce(
          (sum, m) => sum + (m.lectures?.length || 0),
          0,
        ) || 0;

      const completedCount = enrollment.completedLectures?.length || 0;

      const progress =
        totalLectures > 0
          ? Math.round((completedCount / totalLectures) * 100)
          : 0;

      return {
        status: true,
        statusCode: 200,
        message: 'Purchased course details fetched successfully',
        data: {
          enrollmentId: enrollment.id,
          courseId: course.id,
          title: course.title,
          description: course.description,
          introVideoUrl: course.introVideoUrl,
          curriculum,
          totalLectures,
          subscriptionStatus: enrollment.subscriptionStatus || '',
          completedLectures: enrollment.completedLectures || [],
          lastWatchedLectureId: enrollment.lastWatchedLectureId || null,
          progressPercentage: progress,
          planType: enrollment.planType,
          totalAmount: enrollment.totalAmount,
          accessStartDate: enrollment.accessStartDate,
          accessEndDate: enrollment.accessEndDate,
          instructor,
        },
      };
    } catch (error: any) {
      console.error('Error fetching purchased course:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async markLectureComplete(enrollmentId: string, lectureId: string, userId: string) {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: {
          id: enrollmentId,
          userId,
          paymentStatus: PaymentStatus.PAID,
          softDel: false,
        },
      });

      if (!enrollment) throw new NotFoundException('Enrollment not found, payment pending, or unauthorized.');

      const course: any = await this.courseRepository.findOne({ where: { id: enrollment.courseId, softDel: false } });

      if (!course) throw new NotFoundException('Course not found.');

      const curriculum = course.curriculum || [];

      let lectureFound = false;

      for (const mod of curriculum) {
        if (mod.lectures?.some((lec: any) => lec.id === lectureId)) {
          lectureFound = true;
          break;
        }
      }

      if (!lectureFound) {
        throw new NotFoundException('Lecture does not exist in this course.');
      }

      const completed = Array.isArray(enrollment.completedLectures)
        ? [...enrollment.completedLectures]
        : [];

      if (!completed.includes(lectureId)) {
        completed.push(lectureId);
      }

      enrollment.completedLectures = completed;
      enrollment.lastWatchedLectureId = lectureId;

      const totalLectures = curriculum.reduce(
        (sum: number, mod: any) => sum + (mod.lectures?.length || 0),
        0
      );

      const progress =
        totalLectures > 0
          ? Math.round((completed.length / totalLectures) * 100)
          : 0;

      enrollment.progressPercentage = progress;

      await this.enrollmentRepository.save(enrollment);

      return {
        status: true,
        statusCode: 200,
        message: 'Lecture marked completed successfully',
        data: {
          enrollmentId,
          lectureId,
          progressPercentage: progress,
          completedLectures: completed,
          lastWatchedLectureId: enrollment.lastWatchedLectureId,
        },
      };
    } catch (error: any) {
      console.error('Error marking lecture complete:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}