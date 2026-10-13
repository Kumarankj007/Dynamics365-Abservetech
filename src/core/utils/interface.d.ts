/* eslint-disable @typescript-eslint/no-explicit-any */
export type GlobalStoreInterface = {
  modal: { str: string; data: null | object } | null;
  setModal: (modal, data?) => void;

  drawer: { str: string; data: DrawerData } | null;
  setDrawer: (drawer: string, data?: DrawerData) => void;

  loading: boolean;
  setLoading: (value) => void;
};

export type UserData = {
  id: string;
  fullname?: string;
  email?: string;
  password?: string;
  profile?: string;
  phoneCode?: string;
  phoneNumber?: string;
  role?: string | string[];
  currentRole?: string;
  walletBalance?: number;
  professionalTitle?: string | null;
  location?: string | null;
  website?: string | null;
  bio?: string | null;
  yearsOfExperience?: string | null;
  areasOfExpertise?: string[] | null;
  isActive?: boolean;
  softDel?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface Module {
  id: number;
  title: string;
  description: string;
  lectures: Lecture[];
}

export interface SortableModuleProps {
  module: Module;
  moduleIndex: number;
  isPreview?: boolean;
  modules: Module[];
  setModules: any;
  uploadProgress,
  setUploadProgress,
  attachmentsProgress,
  setAttachmentsProgress,
  moveModule: (moduleId: number, direction: string) => void;
  deleteModule: (moduleId: number) => void;
  addLecture: (moduleId: number, moduleIndex: number) => void;
  moveLecture: (moduleId: number, lectureId: number, direction: string) => void;
  deleteLecture: (moduleId: number, lectureId: number) => void;
  handleLectureDragEnd: (moduleId: number, event: any) => void;
}

export interface Attachment {
  name: string;
  fileUrl: string;
  fileType: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "png" | "jpg";
  size: number;          // in bytes
  uploadedAt: string;    // ISO date string
}

export interface Lecture {
  id: number;
  title: string;
  type: string;
  videoFile: File | string | null;
  duration: number;
  embedUrl: string;
  attachments?: Attachment[];
  resources: File | string | null;
}

export interface SortableLectureProps {
  lecture: Lecture;
  isPreview?: boolean;
  lectureIndex: number;
  moduleId: number;
  module: any;
  progress?: number;
  onProgress?: (progress: number) => void;
  attachmentsProgress?: number;
  setAttachmentsProgress?: (progress: number) => void;
  setModules: any;
  moveLecture: (moduleId: number, lectureId: number, direction: string) => void;
  deleteLecture: (moduleId: number, lectureId: number) => void;
}

// payload
const modules = [
  {
    title: "Introduction to Full Stack Development",
    description: "Overview and roadmap of the course",
    order: 1,
    lectures: [
      {
        title: "What is Full Stack Development?",
        order: 1,
        contentType: "UPLOAD_VIDEO",
      },
      {
        title: "Setting Up the Environment",
        order: 2,
        contentType: "EMBED_LINK",
        fileUrl: "https://youtu.be/btEiyMhGJSY?si=aMWgmOBqP9b8hweJ",
      },
    ],
  },
  {
    title: "Backend with Node.js",
    order: 2,
    lectures: [{ title: "Building REST APIs", contentType: "UPLOAD_VIDEO" }],
  },
];
// 'lectureFiles=@2908583-uhd_4096_2160_24fps.mp4;type=video/mp4'
// 'lectureFiles=@1760449132727-p42ayf.mp4;type=video/mp4'


// Settings
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
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  googleClientSecret?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
}

export interface SmtpSettings {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  secure?: boolean;
}