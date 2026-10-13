export interface UsersWithCoursesResponse {
  status: boolean;
  statusCode: number;
  message: string;
  data: {
    users: User[];
    courses: Course[];
  };
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  password: string;
  profile: string | null;
  phoneCode: string | null;
  phoneNumber: string | null;
  role: string[];
  currentRole: string;
  stripeCustomerId: string | null;
  walletBalance: number;
  professionalTitle: string | null;
  location: string | null;
  website: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  areasOfExpertise: string | null;
  isActive: boolean;
  softDel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  approximateDuration: string;
  categoryId: string;
  subCategoryId: string;
  suggestedTags: string[];
  customTags: string[];
  introVideoUrl: string;
  introDuration: number;
  pricingOptions: PricingOption[];
  learningOutcomes: string[];
  curriculum: CurriculumSection[];
  timeSpentId: string | null;
  creatorId: string;
  totalReviews: number;
  averageRating: number;
  status: string;
  softDel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingOption {
  price: number;
  option: "1_MONTH" | "LIFETIME" | string;
  description: string;
  stripePriceId?: string;
}

export interface CurriculumSection {
  order: number;
  title: string;
  description: string;
  lectures: Lecture[];
}

export interface Lecture {
  id: string;
  order: number;
  title: string;
  fileUrl?: string;
  videoUrl?: string;
  duration?: number;
  contentType: "UPLOAD_VIDEO" | "EMBED_LINK" | string;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  fileUrl: string;
  fileType: string;
}