import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface SmtpSettings {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure?: boolean;
}

@Entity('settings')
export class Settings {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ nullable: true })
    appName?: string;

    @Column({ nullable: true })
    baseUrl?: string;

    @Column({ nullable: true })
    port?: string;

    @Column({ type: 'json', nullable: true })
    smtp: any;

    @Column({ nullable: true })
    logo?: string;

    @Column({ nullable: true })
    favicon?: string;

    @Column({ nullable: true })
    awsAccessKeyId?: string;

    @Column({ nullable: true})
    awsSecretAccessKey?: string;

    @Column({ nullable: true })
    awsRegion?: string;

    @Column({ nullable: true })
    awsBucketName?: string;

    @Column({ default: false })
    useAws?: boolean;

    @Column({ nullable: true })
    googleClientId?: string;

    @Column({ nullable: true})
    googleClientSecret?: string;

    @Column({ nullable: true}) 
    stripeSecretKey?: string;

    @Column({ nullable: true })
    stripePublishableKey?: string;

    @Column({ nullable:true })
    stripeWebhookSecret?: string;

    @Column({ nullable: true })
    razorpayKeyId?: string

    @Column({ nullable: true })
    razorpayKeySecret?: string

    @Column({ nullable: true })
    razorpayWebhookSecret?: string

    @Column({ nullable: true })
    paypalClientId?: string

    @Column({ nullable: true })
    paypalClientSecret?: string

    // 'sandbox' (default) or 'live'
    @Column({ nullable: true, default: 'sandbox' })
    paypalMode?: string

    @Column({ nullable: true })
    paypalWebhookId?: string
}
