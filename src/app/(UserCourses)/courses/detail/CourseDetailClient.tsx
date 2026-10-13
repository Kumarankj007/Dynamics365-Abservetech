/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/core/components/ui/radio-group";
import { Label } from "@/core/components/ui/label";
import {
  Star,
  Clock,
  BookOpen,
  Play,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import ImageComponent from "@/core/components/imageComponent";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import Loading from "@/core/components/ui/Loading";
import VideoPlayer from "@/core/components/VideoPlayer";
import { Lecture, Module } from "@/core/utils/interface";
import { subscriptionOption } from "@/core/utils/constants";
import { priceFormat } from "@/core/utils/helperFunction";
import CheckoutModal from "@/core/components/checkout/CheckoutModal";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuthStore } from "@/core/store/authStore";
import AuthModal from "@/core/components/AuthModal";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import useSnackbarStore from "@/core/store/toaster";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { APIURLS } from "@/core/utils/config";
// import PaymentRazorpay from "@/core/components/checkout/CheckoutModalRazorpay";

const CourseDetail = () => {
  const [activeTab, setActiveTab] = useState("course-info");
  const [selectedPlan, setSelectedPlan] = useState({
    price: 34,
    option: "",
    description: "",
  });
  // const paymentList = ["Stripe", "Razorpay"];
  // const [paymentOption, setPaymentOption] = useState("");
  const route = UseLoadingRouter();
  const { token, userData, Settings } = useAuthStore((state) => state);
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // const [rayzorProps, setRayzorProps] = useState({});
  const [courseData, setCourseData] = useState<any>({});
  const [paymentIntent, setPaymentIndent] = useState("");
  const [paymentIntentId, setPaymentIndentId] = useState("");
  const stripekey: any =
    Settings?.stripePublishableKey ||
    process?.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
  const stripePromise = loadStripe(stripekey);
  const myCourse = userData?.id ? courseData?.user?.id === userData?.id : false;
  // console.log(selectedPlan, "selectedPlan");

  const apiCall = async (data: any) => {
    return await Request(
      `${APICONSTANT.courseUserDetail}/${data?.courseId}${userData?.id ? `?userId=${userData?.id}` : ""}`,
      "GET",
    );
  };

  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data?.data, "data");
        if (data?.status && data?.data) {
          setCourseData(data?.data);
          setSelectedPlan(data?.data?.pricingOptions?.[0]);
        }else{
          setCourseData({});
        }
      },
    },
    false,
  );

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    // console.log(
    //   process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    //   "NEXT_PUBLIC_STRIPE_PUBLIC_KEY",
    //   process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY,
    // );
    trigger({ courseId: queryId });
  }, [userData]);

  const apiCallIntent = async (data: any) => {
    const planType = data?.planType;
    return await Request(
      `${
        planType == "LIFETIME"
            ? APICONSTANT.createPaymentIntent
            : APICONSTANT.createPaymentSubscription
        // paymentOption == "Stripe"
        //   ? planType == "LIFETIME"
        //     ? APICONSTANT.createPaymentIntent
        //     : APICONSTANT.createPaymentSubscription
        //   : paymentOption == "Razorpay"
        //     ? planType == "LIFETIME"
        //       ? APICONSTANT.createRazorpayOrder
        //       : APICONSTANT.createRazorpaySubscription
        //     : null
      }`,
      "POST",
      data,
    );
  };
  const { trigger: triggerIntent, isPending: pendingIntent } =
    useCustomMutation(
      apiCallIntent,
      {
        onSuccessCallback: (data: any) => {
          if (data?.clientSecret) {
          // if (paymentOption == "Stripe" && data?.clientSecret) {
            setIsCheckoutOpen(true);
            setPaymentIndent(data?.clientSecret);
            setPaymentIndentId(data?.enrollmentId);
          } 
          // else if (paymentOption == "Razorpay" && (data?.orderId || data?.subscriptionId)) {
          //   setRayzorProps({
          //     ...(data?.orderId && {orderId: data?.orderId}),
          //     ...(data?.subscriptionId && {subscriptionId: data?.subscriptionId}),
          //     enrollmentId: data?.enrollmentId,
          //     currency: data?.pricingDetails?.currency,
          //     amount: data?.pricingDetails?.totalAmount,
          //   });
          //   setIsCheckoutOpen(true);
          // } 
          else {
            showSnackbar("Something went wrong", "error");
          }
        },
      },
      false,
    );

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getTotalLessons = () => {
    return (
      courseData?.curriculum?.reduce(
        (total: any, module: any) => total + module?.lectures?.length || 0,
        0,
      ) || 0
    );
  };

  // const getTotalDuration = () => {
  //   return courseData?.curriculum?.reduce(
  //     (acc: number, it: Module) =>
  //       acc +
  //         it?.lectures?.reduce(
  //           (accLec: number, itLec: Lecture) => accLec + (itLec?.duration || 0),
  //           0,
  //         ) || 0,
  //     0,
  //   );
  // };

  const handleContinueToPurchase = () => {
    // if (paymentOption.trim() == "") {
    //   showSnackbar("Please select a payment method", "error");
    //   return;
    // }

    if (token) {
      const query = new URLSearchParams(window.location.search);
      const queryId = query.get("id");
      if (selectedPlan?.option != "") {
        triggerIntent({
          planType: selectedPlan?.option,
          courseId: queryId,
          paymentMethod: "Stripe",
          // paymentMethod: paymentOption,
        });
      }
    } else {
      setIsAuthOpen(true);
    }
  };

  const onClose = () => {
    setIsCheckoutOpen(false);
    // setRayzorProps({});
    // setPaymentOption("")
    setPaymentIndent("");
    setPaymentIndentId("");
  };

  const getSelectedPlanDetails = () => {
    // const planData =
    //   coursesData.pricing[selectedPlan as keyof typeof coursesData.pricing];
    const planData = subscriptionOption?.find(
      (it: any) => it?.id == selectedPlan?.option,
    );
    return {
      option: selectedPlan?.option,
      label: planData?.label || "",
      price: selectedPlan?.price || 0,
      key: planData?.name || "",
    };
  };

  return !isPending ? (
    <>
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-hero pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            {/* Course Header */}
            <Button
              variant="ghost"
              onClick={() => route?.push("/courses/")}
              className="mb-6 text-text-light hover:text-white hover:bg-white/10 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>

            {Object.keys(courseData)?.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Course Info */}
                <div className="lg:col-span-2">
                  {courseData?.title && courseData?.title != "" && (
                    <h1 className="text-3xl md:text-4xl font-bold text-text-light mb-6">
                      {courseData?.title}
                    </h1>
                  )}
                  {courseData?.user?.fullname &&
                    courseData?.user?.fullname != "" && (
                      <p className="text-lg text-text-light/90 mb-6 leading-relaxed">
                        A Course by{" "}
                        <span className="font-semibold">
                          {courseData?.user?.fullname}
                        </span>
                      </p>
                    )}

                  {/* Video Placeholder */}
                  {courseData?.introVideoUrl &&
                    courseData?.introVideoUrl != "" && (
                      <div className="relative bg-black/20 rounded-2xl overflow-hidden aspect-video mb-6 group">
                        {/* <ImageComponent
                      height={500}
                      width={500}
                      src={courseData.videoUrl}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    /> */}
                        <VideoPlayer
                          src={courseData?.introVideoUrl}
                          title={courseData?.title}
                        />
                        {/* <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Watch Preview
                      </Button>
                    </div> */}
                      </div>
                    )}
                </div>

                {/* Right Column - Course Info & Pricing */}
                <div className="lg:col-span-1">
                  {/* Push content down to align with video */}
                  <div className="lg:mt-20 space-y-6">
                    {/* Course Stats */}
                    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {courseData?.averageRating && (
                            <div className="flex items-center gap-2 text-text-light">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">
                                {typeof courseData?.averageRating == "number"
                                  ? courseData?.averageRating
                                  : courseData?.averageRating?.overall ||
                                    0}{" "}
                                ({courseData?.totalReviews || 0})
                              </span>
                            </div>
                          )}
                          {courseData?.curriculum &&
                            courseData?.curriculum?.length > 0 && (
                              <div className="flex items-center gap-2 text-text-light">
                                <BookOpen className="w-5 h-5" />
                                <span>
                                  {courseData?.curriculum?.length} Modules
                                </span>
                              </div>
                            )}

                          {getTotalLessons() > 0 && (
                            <div className="flex items-center gap-2 text-text-light">
                              <Play className="w-5 h-5" />
                              <span>{getTotalLessons()} Lessons</span>
                            </div>
                          )}
                          {courseData?.approximateDurationEntity?.label && (
                            <div className="flex items-center gap-2 text-text-light">
                              <Clock className="w-5 h-5" />
                              <span>
                                {/* {toHoursDecimal(getTotalDuration())} Hours */}
                                {courseData?.approximateDurationEntity?.label}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pricing and Payment */}
                    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                      {/* Pricing Options */}
                      <CardContent className="p-6 space-y-6">
                        <RadioGroup
                          value={selectedPlan?.option}
                          onValueChange={(value: string) => {
                            const plan = courseData?.pricingOptions?.find(
                              (p: any) => p.option === value,
                            );
                            setSelectedPlan(plan);
                          }}
                          className="space-y-3"
                        >
                          {courseData?.pricingOptions?.map(
                            (plan: any, key: number) => (
                              <div
                                key={key}
                                className="flex items-center space-x-3"
                              >
                                <RadioGroupItem
                                  value={plan?.option}
                                  id={plan?.option}
                                  className="border-white/50 text-white"
                                />
                                <Label
                                  htmlFor={plan?.option}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex justify-between items-center text-text-light">
                                    <span className="font-medium">
                                      {subscriptionOption?.find(
                                        (it: any) => it?.id == plan.option,
                                      )?.label || plan.option}
                                    </span>
                                    <span className="font-bold">
                                      {priceFormat(plan.price, 2)} USD
                                    </span>
                                  </div>
                                </Label>
                              </div>
                            ),
                          )}
                        </RadioGroup>

                        {/* Payment Options */}
                        {/* <div>
                          <p className="text-text-light font-semibold mb-3">
                            Choose your Payment Method
                          </p>
                          <div className="flex flex-wrap items-center gap-4">
                            {paymentList?.map((plan: string, key: number) => (
                              <Card
                                key={key}
                                onClick={() => {
                                  onClose();
                                  setPaymentOption(plan || "");
                                }}
                                className={`flex items-center space-x-3 p-2 ${paymentOption == plan ? "bg-primary border transition-all scale-105" : "bg-primary/10 border transition-all"}`}
                              >
                                <Label
                                  htmlFor={plan}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex justify-between items-center text-text-light">
                                    <span
                                      className={
                                        paymentOption == plan
                                          ? "font-bold"
                                          : "font-medium"
                                      }
                                    >
                                      {plan}
                                    </span>
                                  </div>
                                </Label>
                              </Card>
                            ))}
                          </div>
                        </div> */}

                        <Button
                          size="lg"
                          onClick={handleContinueToPurchase}
                          disabled={
                            myCourse || pendingIntent || courseData?.isPurchased
                          }
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                        >
                          {pendingIntent
                            ? "Processing..."
                            : myCourse
                              ? "You can’t buy your own course."
                              : courseData?.isPurchased
                                ? "The Course has been Purchased"
                                : "Continue to Purchase"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[76vh] flex justify-center items-center">
                <h1 className="text-3xl md:text-4xl text-center font-bold text-text-light mb-6">
                  This Course is Not Available
                </h1>
              </div>
            )}
          </div>
        </div>

        {Object.keys(courseData)?.length > 0 && (
          <>
            {/* Sticky Navigation */}
            <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b">
              <div className="max-w-7xl mx-auto px-6">
                <nav className="flex space-x-8">
                  {[
                    ...(courseData?.learningOutcomes?.length > 0
                      ? [{ id: "course-info", label: "Course Info" }]
                      : []),
                    ...(courseData?.curriculum?.length > 0
                      ? [{ id: "curriculum", label: "Curriculum" }]
                      : []),
                    { id: "instructor", label: "Instructor" },
                    { id: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => scrollToSection(tab.id)}
                      className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2 space-y-16">
                  {/* What You Will Learn */}
                  {courseData?.learningOutcomes?.length > 0 && (
                    <section id="course-info">
                      <h2 className="text-3xl font-bold text-foreground mb-8">
                        What you'll learn
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {courseData?.learningOutcomes?.map(
                          (outcome: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                              <p className="text-muted-foreground leading-relaxed text-sm">
                                {outcome}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </section>
                  )}

                  {/* Curriculum */}
                  {courseData.curriculum &&
                    courseData.curriculum?.length > 0 && (
                      <section id="curriculum">
                        <h2 className="text-3xl font-bold text-foreground mb-8">
                          Curriculum
                        </h2>
                        <Accordion
                          type="multiple"
                          defaultValue={courseData.curriculum.map(
                            (_: any, index: number) => `module-${index}`,
                          )}
                          className="space-y-2"
                        >
                          {courseData.curriculum.map(
                            (module: Module, index: number) => (
                              <AccordionItem
                                key={index}
                                value={`module-${index}`}
                                className="border rounded-lg"
                              >
                                <AccordionTrigger className="px-6 py-4 hover:no-underline bg-gradient-card">
                                  <span className="font-semibold text-foreground">
                                    {module?.title}
                                  </span>
                                </AccordionTrigger>
                                {module?.lectures?.length > 0 && (
                                  <AccordionContent className="px-6 pb-4">
                                    <div className="space-y-2">
                                      {module?.lectures?.map(
                                        (
                                          lesson: Lecture,
                                          lessonIndex: number,
                                        ) => (
                                          <div
                                            key={lessonIndex}
                                            className="flex items-center gap-3 py-2"
                                          >
                                            <Play className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              {lesson?.title}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </AccordionContent>
                                )}
                              </AccordionItem>
                            ),
                          )}
                        </Accordion>
                      </section>
                    )}

                  {/* Instructor */}
                  <section id="instructor">
                    <h2 className="text-3xl font-bold text-foreground mb-8">
                      Instructor
                    </h2>
                    <Card className="bg-gradient-card border-0">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          {/* {courseData?.user?.profile &&
                          courseData?.user?.profile != "" && (
                          )} */}
                          <ImageComponent
                            height={500}
                            width={500}
                            // src={courseData?.user?.profile}
                            src={
                              courseData?.user?.profile?.startsWith("http")
                                ? courseData?.user?.profile
                                : APIURLS?.imageUrl +
                                  "/auth" +
                                  courseData?.user?.profile
                            }
                            alt={courseData?.user?.fullname}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-1">
                              {courseData?.user?.fullname ||
                                courseData?.user?.name ||
                                "Unknown"}
                            </h3>
                            {courseData?.user?.professionalTitle && (
                              <Badge className="mb-3 bg-primary/10 text-primary">
                                {courseData?.user?.professionalTitle}
                              </Badge>
                            )}
                            {courseData?.user?.bio && (
                              <p className="text-muted-foreground leading-relaxed">
                                {courseData?.user?.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Reviews */}
                  {courseData?.reviews?.length > 0 && (
                    <section id="reviews">
                      <h2 className="text-3xl font-bold text-foreground mb-8">
                        Featured Reviews
                      </h2>
                      <div className="space-y-6">
                        {courseData?.reviews?.map(
                          (review: any, index: number) => {
                            const profile = review?.user?.profile?.startsWith(
                              "http",
                            )
                              ? review?.user?.profile
                              : APIURLS?.imageUrl +
                                "/auth" +
                                review?.user?.profile;
                            return (
                              <Card
                                key={index}
                                className="bg-gradient-card border-0"
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4">
                                    {review?.user && (
                                      <Avatar className="w-12 h-12">
                                        <AvatarImage
                                          src={profile}
                                          alt={review?.user?.fullname || "User"}
                                        />
                                        <AvatarFallback className="bg-primary/20 text-white text-[18px] font-semibold border border-primary/40 uppercase">
                                          {review?.user?.fullname
                                            ?.split(" ")
                                            ?.map((n: any) => n[0])
                                            ?.join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-foreground">
                                          {review.title}
                                        </h4>
                                        <div className="flex">
                                          {Array.from({
                                            length: review.rating,
                                          }).map((_, i) => (
                                            <Star
                                              key={i}
                                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <p className="text-muted-foreground italic">
                                        {review.review}
                                      </p>
                                      {review?.replies?.length > 0 && (
                                        <p className="italic text-right font-bold">
                                          -{review?.replies[0]?.response}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          },
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Checkout Modal */}
      {Object.keys(courseData)?.length > 0 && token ? (
        <Elements
          stripe={stripePromise}
          // options={{
          //   clientSecret:
          //     paymentIntent,
          // }}
        >
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={onClose}
            courseTitle={courseData.title}
            userId={courseData?.user?.id}
            clientSecret={paymentIntent}
            paymentIntentId={paymentIntentId}
            selectedPlan={getSelectedPlanDetails()}
          />
        </Elements>
      ) : (
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}
      {/* {Object.keys(courseData)?.length > 0 &&
      paymentOption == "Stripe" &&
      token ? (
        <Elements
          stripe={stripePromise}
          // options={{
          //   clientSecret:
          //     paymentIntent,
          // }}
        >
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={onClose}
            courseTitle={courseData.title}
            userId={courseData?.user?.id}
            clientSecret={paymentIntent}
            paymentIntentId={paymentIntentId}
            selectedPlan={getSelectedPlanDetails()}
          />
        </Elements>
      ) : Object.keys(rayzorProps)?.length > 0 &&
        paymentOption == "Razorpay" &&
        token ? (
        <>
          <PaymentRazorpay {...rayzorProps} onClose={onClose} selectedPlan={selectedPlan?.option} />
        </>
      ) : (
        !token && (
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        )
      )} */}
      {/* {paymentIntent != "" && paymentIntentId != "" && (
      )} */}
    </>
  ) : (
    <Loading hFull />
  );
};

export default CourseDetail;
