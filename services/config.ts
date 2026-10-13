const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001/";

export const APIURLS = {
  baseUrl: BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/",
  imageUrl: BASE_URL,
};

export const APPCONFIG = {
  name: "Dynamic 365 Admin Panel",
  appMode: process.env.NODE_ENV || "development",
};

export const APICONSTANT = {
  LOGIN: "auth/admin/login",
  GET_SETTINGS: "admins/settings/",
  UPDATE_SETTINGS: "admins/settings/update",
  GET_PROFILE: "auth/admin/profile",
  UPDATE_PROFILE: "auth/admin/update",
  // GET_CAREER: "api/job/careers",
  // GET_JOB: "api/job",
  // GET_INQUERY: "api/contactInquiry/",
  GET_ADMIN: "auth/admin/admins",
  ADD_ADMIN: "auth/admin/register",
  UPDATE_ADMIN: "api/admin/profile",
  GET_ADMINROLE: "api/admin/role",
  GET_ADMINROLETITLE: "api/admin/roles/title",
  GET_ADMINROLEPERMISSIONS: "api/admin/permissions",
  GET_STUDENTS: "admins/admin/users",
  UPDATE_STUDENT_STATUS: "admins/admin/users/status",
  RESET_PASSWORD_STUDENTS: "admins/admin/users/reset-password",
  GET_INSTRUCTORS: "admins/admin/instructors",
  CREATE_INSTRUCTORS: "admins/admin/create-instructor",
  GET_CATEGORY: "admins/category/fetchAll",
  CREATE_CATEGORY: "admins/category/add",
  UPDATE_CATEGORY: "admins/category/update",
  GET_SUBCATEGORY: "admins/subcategory/fetchAll",
  CREATE_SUBCATEGORY: "admins/subcategory/add",
  UPDATE_SUBCATEGORY: "admins/subcategory/update",

  // dashboard:
  GET_DASHBOARD: "admins/dashboard",
  
  // duration Band:
  GET_DURATION_BANDS: "admins/durationband/fetchAll",
  CREATE_DURATION_BANDS: "admins/durationband/add",
  UPDATE_DURATION_BANDS: "admins/durationband/update",
  ACTIVE_DURATION_BANDS: "admins/durationband/active",

  // duration Band:
  GET_TAGS_BANDS: "admins/tags/fetchAll",
  CREATE_TAGS_BANDS: "admins/tags/add",
  UPDATE_TAGS_BANDS: "admins/tags/update",
  DELETE_TAGS_BANDS: "admins/tags/delete",
  
  // review course:
  GET_COURSE_ALL: "admins/course/all",
  UPDATE_COURSE_STATUS: "admins/course/status",
  
  // user review the course
  GET_COURSE_REVIEW: "admins/course/reviews",
  UPDATE_COURSE_REVIEW: "admins/course/review",
  UPDATE_COURSE_AVAILABILITY: "users/course/course-availability",
  UPDATE_COURSE_DELETE: "admins/course/deleteReview",
  

  // create course:
  CREATE_COURSE_TITLE: "users/course/add-title",
  CREATE_COURSE_LEARNING: "users/course/learning-outcomes",
  CREATE_COURSE_DESCRIPTION: "users/course/course-description",
  CREATE_COURSE_CURRICULUM: "users/course/course-curriculum",
  CREATE_COURSE_PRICING: "users/course/course-pricing",
  UPLOAD_INTRO_VIDEO: "users/course/upload-lecture-video?type=course-intros",
  UPLOAD_LECTURES_VIDEO: "users/course/upload-lecture-video?type=course-lectures",
  UPLOAD_LECTURES_ATTACHMENTS: "users/course/upload-lecture-attachment?type=course-attachments",
  DELETE_COURSE: "users/course/deleteCourse",
  APPROVE_CHANGES: "users/course/approve-changes",

  // publish course:
  PUBLISH_COURSE: "users/course/submit",

  // manage course:
  GET_ALL_MANAGE_COURSES: "users/course/my-courses",
  GET_EDIT_COURSES: "users/course/course-details",

  // commissions:
  GET_COMMISSION: "admins/commission/fetch",
  ADD_COMMISSION: "admins/commission/add",
  UPDATE_COMMISSION: "admins/commission/update",

  // commissions override
  ADD_COMMISSION_OVERRIDE: "admins/commission/override/add",
  UPDATE_COMMISSION_OVERRIDE: "admins/commission/override",

  // admin approval queue:
  GET_APPROVAL_LIST: "admins/approval-queue/list",
  UPDATE_APPROVAL_LIST: "admins/approval-queue/update",
  EDIT_AMT_APPROVAL_LIST: "admins/approval-queue/instructor-amt",

  // payout request:
  GET_PAYOUT_REQUESTS: "admins/approval-queue/payouts",
  UPDATE_PAYOUT_STATUS: "admins/approval-queue/payout/update",

  //Transactions
  GET_TRANSACTIONS: "admins/transactions",
  EXPORT_TRANSACTIONS: "admins/transactions/export",

  //Enrollments
  GET_ENROLLMENTS: "admins/enrollments/all",
  STATUS_ENROLLMENTS: "admins/enrollments",
  GET_DROPDOWN_STUDENT_LIST: "admins/admin/access",
  CREATE_ENROLLMENT: "users/enrollment/admin-grant-access"

} as const

export type APIKeys = keyof typeof APICONSTANT;