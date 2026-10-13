const user = "auth/user/";
const admin = "admins/";
const course = "users/course/";
const enrollment = "users/enrollment/";
const payout = "users/payout/"
const transactions = "users/transactions"
const dashboard = "users/dashboard"
export default class APICONSTANT {
  // user routes:
  static readonly login = user + `login`;
  static readonly register = user + `register`;
  static readonly forgotPassword = user + `forgot-password`;
  static readonly resetPassword = user + `reset-password`;
  static readonly changePassword = user + `change-password`;
  static readonly googleLogin = user + `google`;
  static readonly profile = user + `profile`;
  static readonly switchRole = user + `switch-role`;
  static readonly update = user + `update`;
  static readonly delete = user + `delete`;

  // course routes: for instructor
  static readonly dashboard = dashboard;
  static readonly addTitle = course + `add-title`;
  static readonly learning = course + `learning-outcomes`;
  static readonly description = course + `course-description`;
  static readonly curriculum = course + `course-curriculum`;
  static readonly pricing = course + `course-pricing`;
  static readonly submit = course + `submit`;
  static readonly videoUpload = course + `upload-lecture-video`;
  static readonly attachmentsUpload = course + `upload-lecture-attachment`;
  static readonly draftCourse = course + `my-active-course`;
  static readonly myCourse = course + `my-courses`;
  static readonly courseDetails = course + `course-details`;
  static readonly reviewInstructor = course + `reviews/instructor`;
  static readonly reviewReplyInstructor = course + `reply`;
  static readonly deleteCourse = course + `deleteCourse`;

  // review for users:
  static readonly createReview = course + `create/review`;
  static readonly getReview = course + `fetch/review`;
  static readonly deleteReview = course + `deleteReview`;

  // course routes: for student
  static readonly courseUserOverview = course + `allCourses`;
  static readonly courseUserDetail = course + `view`;
  
  // stripe
  static readonly createPaymentIntent = enrollment + `create-payment-intent`;
  static readonly createPaymentSubscription = enrollment + `create-subscription`;
  static readonly checkPaymentStatus = enrollment + `check-payment-status`;
  
  // Razorpay
  static readonly createRazorpayOrder = enrollment + `create-razorpay-order`;
  static readonly checkRazorpayPaymentStatus = enrollment + `check-razorpay-payment-status`;
  static readonly createRazorpaySubscription = enrollment + `create-razorpay-subscription`;

  // enrollment:
  static readonly fareEstimation = enrollment + `fare-estimation`;
  static readonly studentCourse = enrollment + `my-courses`;
  static readonly cancelSubscription = enrollment + `cancel-subscription`;
  static readonly studentList = enrollment + `instructor`;
  static readonly studentCourseDetail = enrollment + `view`;
  static readonly markAsComplete = enrollment + `lectures/complete`;
  
  // payout:
  static readonly payoutRequest = payout + `request`;
  static readonly payoutList = payout + `list`;
  static readonly transaction = transactions;

  // admin routes:
  static readonly categoryList = admin + `category/fetchAll`;
  static readonly subcategoryList = admin + `subcategory/fetchAll`;
  static readonly durationBandList = admin + `durationband/fetchAll`;
  static readonly suggestedTagsList = admin + `tags/fetchAll`;
  static readonly settings = admin + `settings`;
}
