export interface SettingsResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: SettingsData;
}

export interface SettingsData {
  id?: string;
  appName?: string;
  baseUrl?: string;
  port?: string;
  smtp?: SmtpSettings;
  logo?: string;
  favicon?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  awsBucketName?: string;
  useAws?: boolean;
  googleClientId?: string;
  googleClientSecret?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
}

export interface SmtpSettings {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  secure?: boolean;
}