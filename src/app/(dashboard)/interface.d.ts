export interface CourseData {
  enrollmentId: string;
  courseId: string;
  title: string;
  description: string;
  introVideoUrl: string;
  curriculum: CurriculumItem[];
  totalLectures: number;
  completedLectures: string[];
  lastWatchedLectureId: string | null;
  progressPercentage: number;
  planType: "1_MONTH" | "3_MONTHS" | "6_MONTHS" | "12_MONTHS" | string;
  totalAmount: string;
  accessStartDate: string;
  subscriptionStatus?: string;
  accessEndDate: string;
  instructor: Instructor;
}

export interface CurriculumItem {
  order: number;
  title: string;
  description: string;
  lectures: Lecture[];
}

export interface Lecture {
  id: string;
  order: number;
  title: string;
  duration?: number;          // only for upload video
  fileUrl?: string;           // UPLOAD_VIDEO
  videoUrl?: string;          // EMBED_LINK
  contentType: "UPLOAD_VIDEO" | "EMBED_LINK";
  isCompleted: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  fileUrl: string;
  fileType: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "png" | "jpg";
  size: number;          // in bytes
  uploadedAt: string;    // ISO date string
}

export interface Instructor {
  id: string;
  fullname: string;
  email: string;
  password: string;
  profile: string;
  phoneCode: string;
  phoneNumber: string;
  role: string[];
  currentRole: string;
  stripeCustomerId: string | null;
  professionalTitle: string;
  location: string;
  website: string;
  bio: string;
  yearsOfExperience: string;
  areasOfExpertise: string[];
  isActive: boolean;
  softDel: boolean;
  createdAt: string;
  updatedAt: string;
}
