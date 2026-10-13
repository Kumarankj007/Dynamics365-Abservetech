export enum Status {
  DRAFT = 'Draft', //Pending
  IN_REVIEW = 'In Review', //Completed and Submitted
  PUBLISHED = 'Published', //Approved
  CHANGES_REQUESTED = 'Changes Requested',
  REJECTED = 'Rejected', // Declined,
  NO_CHANGES = 'No Changes',
  AWAITING = 'Awaiting',
  COMPLETED = 'Completed'
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
  DECLINED = 'Declined'
}

export enum AttachmentFileType {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
}

export enum PaymentMethod {
  STRIPE = 'Stripe',
  RAZORPAY = 'Razorpay',
  PAYPAL = 'PayPal',
  CASHAPP = 'CashApp',
  ZELLE = 'Zelle',
  MANUAL = 'Manual',
  ADMINGRANT = 'AdminGrant'
}

export enum SubscriptionStatus {
  Active = 'Active',
  PastDue = 'PastDue',
  Inactive = 'Inactive',
  Cancelled = 'Cancelled'
}

export enum ApproximateDuration {
  LESS_THAN_5 = 'LESS_THAN_5',
  BETWEEN_5_10 = 'BETWEEN_5_10',
  BETWEEN_10_20 = 'BETWEEN_10_20',
  MORE_THAN_20 = 'MORE_THAN_20'
}

export enum ReviewStatus {
  PUBLISHED = 'Published',
  UNPUBLISHED = 'Unpublished',
}

export enum PricingOption {
  ONE_MONTH = '1_MONTH',
  SIX_MONTHS = '6_MONTHS',
  ONE_YEAR = '1_YEAR',
  LIFETIME = 'LIFETIME',
  FREE = 'FREE'
}

export enum ContentType {
  UPLOAD_VIDEO = 'UPLOAD_VIDEO',
  EMBED_LINK = 'EMBED_LINK',
  READING_MATERIAL = 'READING_MATERIAL'
}