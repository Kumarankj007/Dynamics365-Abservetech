/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { Label } from "@/core/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { Badge } from "@/core/components/ui/badge";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Lock, CreditCard, Calendar, Shield, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/core/store/authStore";
import Login from "@/app/(frontend)/login/page";
import Signup from "@/app/(frontend)/signup/page";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  CardElement,
} from "@stripe/react-stripe-js";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import useSnackbarStore from "@/core/store/toaster";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  userId: string;
  clientSecret: string;
  paymentIntentId: string;
  selectedPlan: {
    option: string;
    label: string;
    price: number;
    key: string;
  };
}

const CheckoutModal = ({
  isOpen,
  onClose,
  courseTitle,
  userId = "",
  selectedPlan,
  clientSecret,
  paymentIntentId,
}: CheckoutModalProps) => {
  // const { toast } = useToast();
  const router = UseLoadingRouter();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const { token, userData } = useAuthStore((state) => state);
  const [login, setLogin] = useState(true);
  const stripe = useStripe();
  const elements = useElements();
  const [fareEstimation, setFareEstimation] = useState({
    basePrice: selectedPlan.price,
    finalAmount: selectedPlan.price,
    taxAmount: 0,
    taxPercentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    country: "",
    postalCode: "",
    saveCard: false,
    agreeTerms: false,
  });

  const CardInput = {
    base: {
      color: "#f5f5f5",
      fontSize: "16px",
      "::placeholder": {
        color: "rgba(255,255,255,0.6)",
      },
    },
    invalid: { color: "#ef4444" },
  };

  const tax = fareEstimation?.taxAmount; //0.08; // Example 8% tax
  const total = (fareEstimation?.basePrice ?? 0.0) + tax;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // const isFormValid = () => {
  //   const { email, password, agreeTerms } = formData;
  //   const hasValidEmail = email.includes("@");
  //   const hasValidPassword = password.length >= 6;

  //   if (paymentMethod === "card") {
  //     const { cardName, cardNumber, cardExpiry, cardCvc } = formData;
  //     return (
  //       hasValidEmail &&
  //       hasValidPassword &&
  //       cardName &&
  //       cardNumber &&
  //       cardExpiry &&
  //       cardCvc &&
  //       agreeTerms
  //     );
  //   }

  //   return hasValidEmail && hasValidPassword && agreeTerms;
  // };

  // fare estimation
  const apiCallFare = async (data: any) => {
    return await Request(`${APICONSTANT.fareEstimation}`, "POST", data);
  };

  const { trigger: triggerFare } = useCustomMutation(
    apiCallFare,
    {
      onSuccessCallback: (data: any) => {
        if (data?.status) {
          setFareEstimation(data);
          // console.log(data, "data");
        }
      },
    },
    false,
  );

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const queryId = query.get("id");
    // console.log({
    //   courseId: queryId,
    //   pricingOption: selectedPlan?.option,
    // });
    if (selectedPlan?.option !== "") {
      triggerFare({
        courseId: queryId,
        pricingOption: selectedPlan?.option,
      });
    }
  }, [selectedPlan?.option]);

  // payment api
  const apiCall = async (data: any) => {
    return await Request(`${APICONSTANT.checkPaymentStatus}`, "POST", data);
  };

  const { trigger } = useCustomMutation(apiCall, {
    onSuccessCallback: (data: any) => {
      if (data?.status) {
        router?.push("/student/dashboard/");
      }
      setLoading(false);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;
    setLoading(true);
    const cardElement =
      elements.getElement(CardNumberElement) ||
      elements.getElement(CardElement);

    if (!cardElement) {
      console.error("Card element not found");
      setLoading(false);
      return;
    }

    if (!formData?.agreeTerms) {
      showSnackbar("Accept the terms and conditions", "error");
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.cardName || undefined,
            email: formData.email || undefined,
          },
        },
        setup_future_usage: "off_session",
      },
    );

    // console.log(error, "paymentIntent", paymentIntent)

    // 3️⃣ Handle result
    if (error) {
      if (paymentIntentId) {
        trigger({
          paymentIntentId: error?.payment_intent?.id,
          enrollmentId: paymentIntentId,
        });
      } else {
        showSnackbar(
          error.message ? error.message : "something went wrong",
          "error",
        );
      }
      setLoading(false);
      onClose();
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // console.log("✅ Payment succeeded:", paymentIntent);
      // console.log(queryId, "object");
      trigger({
        paymentIntentId: paymentIntent?.id,
        enrollmentId: paymentIntentId,
      });
    } else {
      setLoading(false);
    }
  };

  // console.log(loading, "loading")

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => {
    if (!nextOpen && !loading) {
      onClose?.();
    }
  }}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-hero-bg border border-white/10 text-text-light p-0">
        {/* Mobile sticky footer with total */}
        {/* <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-hero-bg border-t border-white/10 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-light font-semibold">Total Due:</span>
            <span className="text-2xl font-bold text-text-light">
              ${total.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isProcessing}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isProcessing ? "Processing..." : "Pay & Enroll Now"}
          </Button>
        </div> */}

        <div className="grid lg:grid-cols-5 min-h-[600px]">
          {/* Left Panel - Order Summary */}
          <div className="lg:col-span-2 bg-dark-section border-r border-white/10 p-8">
            <div className="lg:sticky lg:top-8">
              {/* <h2 className="text-2xl font-bold text-text-light mb-6">
                Order Summary
              </h2> */}
              <DialogTitle className="text-2xl font-bold text-text-light mb-6">
                Order Summary
              </DialogTitle>

              <div className="space-y-6">
                {/* Course Info */}
                <div>
                  <h3 className="font-semibold text-text-light mb-2 line-clamp-2">
                    {courseTitle}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {selectedPlan.label}
                  </Badge>
                </div>

                {/* Price Breakdown */}
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4 space-y-3">
                    {fareEstimation?.basePrice && (
                      <div className="flex justify-between text-text-light">
                        <span>Subtotal</span>
                        <span>
                          $
                          {isNaN(Number(fareEstimation?.basePrice))
                            ? "0.00"
                            : Number(fareEstimation.basePrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {/* <div className="flex justify-between text-text-muted-light">
                      <span>Tax/VAT</span>
                      <span>
                        ${isNaN(Number(tax)) ? "0.00" : Number(tax).toFixed(2)}
                      </span>
                    </div> */}
                    {fareEstimation?.finalAmount && (
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between text-text-light font-bold text-lg">
                          <span>Total Due</span>
                          <span>
                            $
                            {isNaN(Number(fareEstimation?.finalAmount))
                              ? "0.00"
                              : Number(fareEstimation.finalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Course Benefits */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-text-muted-light">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Access for{" "}
                      {
                        selectedPlan.key
                        // accessWindows[
                        //   selectedPlan.key as keyof typeof accessWindows
                        // ]
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-text-muted-light">
                    <ArrowRight className="w-4 h-4" />
                    <span>Instant access after payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-muted-light">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-text-muted-light text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Secure, encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Account & Payment */}
          {userData?.id == userId ? (
            <div className="flex justify-center items-center lg:col-span-3 p-8 pb-24 lg:pb-8">
              <h2 className="text-2xl font-bold text-text-light mb-8">
                You can’t buy your own course.
              </h2>
            </div>
          ) : (
            <div className="lg:col-span-3 p-8 pb-24 lg:pb-8">
              <div className="max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-text-light mb-8">
                  Complete Your Purchase
                </h2>

                <div className="space-y-8">
                  {!token && (
                    <>
                      {login ? (
                        <Login modal={true} setLogin={setLogin} />
                      ) : (
                        <Signup modal={true} setLogin={setLogin} />
                      )}
                    </>
                  )}
                  {token && (
                    <div>
                      {/* Payment Method */}
                      <div>
                        <h3 className="text-lg font-semibold text-text-light mb-4">
                          Payment method
                        </h3>

                        <Tabs
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="space-y-4"
                        >
                          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                            <TabsTrigger
                              value="card"
                              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Card
                            </TabsTrigger>
                            <TabsTrigger
                              value="paypal"
                              disabled
                              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                              PayPal
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="card" className="space-y-4">
                            {/* <div>
                            <Label
                              htmlFor="cardName"
                              className="text-text-light"
                            >
                              Cardholder name *
                            </Label>
                            <Input
                              id="cardName"
                              value={formData.cardName}
                              onChange={(e) =>
                                handleInputChange("cardName", e.target.value)
                              }
                              className="bg-white/5 border-white/20 text-text-light placeholder:text-text-muted-light focus:border-primary"
                              placeholder="Full name on card"
                            />
                          </div> */}

                            <div>
                              <Label
                                htmlFor="cardNumber"
                                className="text-text-light"
                              >
                                Card number *
                              </Label>
                              <div className="bg-white/5 border border-white/20 rounded-md p-2 text-text-light focus-within:border-primary">
                                <CardNumberElement
                                  id="cardNumber"
                                  options={{
                                    placeholder: "1234 5678 9012 3456",
                                    style: CardInput,
                                    disabled: loading,
                                  }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor="cardExpiry"
                                  className="text-text-light"
                                >
                                  Expiry *
                                </Label>
                                <div className="bg-white/5 border border-white/20 rounded-md p-2 text-text-light focus-within:border-primary">
                                  <CardExpiryElement
                                    options={{
                                      placeholder: "MM/YY",
                                      style: CardInput,
                                      disabled: loading,
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label
                                  htmlFor="cardCvc"
                                  className="text-text-light"
                                >
                                  CVC *
                                </Label>
                                {/* <Input
                                  id="cardCvc"
                                  value={formData.cardCvc}
                                  onChange={(e) =>
                                    handleInputChange("cardCvc", e.target.value)
                                  }
                                  className="bg-white/5 border-white/20 text-text-light placeholder:text-text-muted-light focus:border-primary"
                                  placeholder="123"
                                /> */}
                                <div className="bg-white/5 border border-white/20 rounded-md p-2 text-text-light focus-within:border-primary">
                                  <CardCvcElement
                                    options={{
                                      placeholder: "123",
                                      style: CardInput,
                                      disabled: loading,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="country"
                                className="text-text-light"
                              >
                                Country *
                              </Label>
                              <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) =>
                                  handleInputChange("country", e.target.value)
                                }
                                className="bg-white/5 border-white/20 text-text-light placeholder:text-text-muted-light focus:border-primary"
                                placeholder="United States"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="postalCode"
                                className="text-text-light"
                              >
                                ZIP/Postal *
                              </Label>
                              <Input
                                id="postalCode"
                                value={formData.postalCode}
                                onChange={(e) =>
                                  handleInputChange(
                                    "postalCode",
                                    e.target.value
                                  )
                                }
                                className="bg-white/5 border-white/20 text-text-light placeholder:text-text-muted-light focus:border-primary"
                                placeholder="12345"
                              />
                            </div>
                          </div> */}

                            {/* <div className="flex items-center space-x-2">
                            <Checkbox
                              id="saveCard"
                              checked={formData.saveCard}
                              onCheckedChange={(checked) =>
                                handleInputChange("saveCard", !!checked)
                              }
                              className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label
                              htmlFor="saveCard"
                              className="text-text-muted-light text-sm"
                            >
                              Save card for future purchases
                            </Label>
                          </div> */}

                            <div className="flex items-center gap-2 text-sm text-text-muted-light">
                              <Shield className="w-4 h-4" />
                              <span>Secured by Stripe</span>
                            </div>
                          </TabsContent>

                          <TabsContent value="paypal" className="space-y-4">
                            <Button
                              size="lg"
                              className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold"
                            >
                              Continue with PayPal
                            </Button>

                            <div className="flex items-center gap-2 text-sm text-text-muted-light">
                              <Shield className="w-4 h-4" />
                              <span>Secured by PayPal</span>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Terms & CTA */}
                      <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="agreeTerms"
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) =>
                              handleInputChange("agreeTerms", !!checked)
                            }
                            disabled={loading}
                            className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                          />
                          <Label
                            htmlFor="agreeTerms"
                            className="text-text-muted-light text-sm leading-relaxed"
                          >
                            I agree to the{" "}
                            <button className="text-primary hover:underline">
                              Terms & Conditions
                            </button>{" "}
                            and{" "}
                            <button className="text-primary hover:underline">
                              Privacy Policy
                            </button>
                          </Label>
                        </div>

                        {/* Desktop CTA */}
                        <div className="block">
                          <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            size="lg"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                          >
                            {loading ? "Processing..." : "Pay & Enroll Now"}
                          </Button>
                          <p className="text-center text-sm text-text-muted-light mt-2">
                            You will be charged $
                            {isNaN(Number(total))
                              ? "0.00"
                              : Number(total).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
