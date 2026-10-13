/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
// import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Separator } from "@/core/components/ui/separator";
import Link from "next/link";
import { User, GraduationCap, UserCheck } from "lucide-react";
import ErrorIcon from "@mui/icons-material/Error";
import InputCard from "@/core/components/InputCard";
import { Controller, useForm } from "react-hook-form";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
// import { getPhoneCodeStr } from "@/core/utils/helperFunction";
import { generateGoogleOAuthUrl } from "@/core/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { useAuthStore } from "@/core/store/authStore";

const Signup = ({
  modal = false,
  setLogin = () => {},
  onClose = () => {},
}: {
  modal?: boolean;
  onClose?: () => void;
  setLogin?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = UseLoadingRouter();
  const { Settings, SignupApi } = useAuthStore((state) => state);
  const AuthUrl = generateGoogleOAuthUrl(
    Settings?.googleClientId,
    Settings?.baseUrl,
  );
  const apiCall = async (data: any) => {
    return await SignupApi(data);
  };
  const { trigger, isPending } = useCustomMutation(apiCall, {
    onSuccessCallback: (data: any) => {
      if (data?.success) {
        if (!modal) {
          router.push(
            data?.newUser?.currentRole == "User" ? "/" : "/instructor/dashboard",
          );
        } else {
          onClose();
        }
      }
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = async (e: any) => {
    // const selected = CountryCode.find((item) => item.label == e.phoneCode);

    const obj = {
      fullname: e.fullname,
      email: e.email,
      password: e.password,
      // phoneNumber: e.phoneNumber,
      // phoneCode: getPhoneCodeStr(e.phoneCode, true),
      role: e.role,
    };
    // console.log(obj, "obj");
    trigger(obj);
  };
  return (
    <div
      className={
        (modal ? "rounded-lg py-7" : "min-h-screen py-24 bg-white") +
        " pb-8 px-4"
      }
    >
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="space-y-4">
            {!modal && (
              <h2 className="text-2xl font-bold text-slate-800">
                Welcome to Dynamics365 Lab
              </h2>
            )}
            <h1
              className={
                (modal ? "text-white" : "text-slate-900") +
                " text-3xl font-bold "
              }
            >
              Create Account
            </h1>
            <p
              className={
                (modal ? "text-white" : "text-slate-600") +
                " text-sm leading-relaxed max-w-sm mx-auto"
              }
            >
              {modal
                ? "We'll create your account during checkout."
                : "Join thousands of learners and instructors mastering Microsoft Dynamics 365."}
            </p>
          </div>
        </div>

        {/* Sign Up Card */}
        <Card className="shadow-xl border border-slate-200 bg-transparent">
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <InputCard
                  name="fullname"
                  label="Full Name"
                  iconName="FiUser"
                  iconLib="fi"
                  dark={modal}
                  inputProps={{ autoFocus: true }}
                  placeholder="Enter Your full name"
                  required={true}
                  requiredMsg="Full name is required"
                  control={control}
                  errors={errors}
                  pattern={{
                    value: /^[A-Za-z\s]+$/,
                    message: "Full name should contain only letters.",
                  }}
                />
              </div>
              <div className="space-y-2">
                <InputCard
                  name="email"
                  label="Email"
                  iconName="CiMail"
                  iconLib="ci"
                  dark={modal}
                  placeholder="Enter your email address"
                  required={true}
                  requiredMsg="Email is required"
                  control={control}
                  errors={errors}
                  pattern={{
                    value: /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid Email",
                  }}
                />
              </div>
              <div className="space-y-2">
                <InputCard
                  name="password"
                  label="Password"
                  iconName="CiLock"
                  iconLib="ci"
                  dark={modal}
                  placeholder="Create a password"
                  required={true}
                  type="password"
                  requiredMsg="Password is required"
                  control={control}
                  errors={errors}
                  pattern={{
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
                    message:
                      "Password must be 8–20 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character",
                  }}
                />
              </div>

              {/* <div className="space-y-2">
                <InputCard
                  name="phoneNumber"
                  phName="phoneCode"
                  label="Phone Number"
                  iconName="MdLocalPhone"
                  iconLib="md"
                  placeholder="Enter your phone number"
                  required={true}
                  requiredMsg="Phone Number is required"
                  control={control}
                  errors={errors}
                  pattern={{
                    value: /^[0-9]+$/,
                    message: "Phone Number Invalid",
                  }}
                />
              </div> */}

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-900">
                  I want to join as a
                </Label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Please select a role" }}
                  render={({ field, fieldState }) => (
                    <>
                      <div className="grid grid-cols-1 gap-3">
                        {/* Student Card */}
                        <div
                          onClick={() => field.onChange("User")}
                          className={
                            (modal ? "" : "bg-slate-50 hover:bg-slate-100") +
                            ` p-4 rounded-lg border-2 cursor-pointer transition-all duration-200  ${
                              field.value === "User"
                                ? "border-primary shadow-lg"
                                : ""
                            }`
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-full ${
                                field.value === "User"
                                  ? "bg-primary text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3
                                  className={
                                    (modal ? "text-white" : "text-slate-900") +
                                    " font-medium "
                                  }
                                >
                                  Student
                                </h3>
                                {field.value === "User" && (
                                  <UserCheck className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p
                                className={
                                  (modal ? "text-white" : "text-slate-600") +
                                  " text-xs mt-1"
                                }
                              >
                                Learn, track progress, and manage your
                                subscriptions.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Instructor Card */}
                        <div
                          onClick={() => field.onChange("Instructor")}
                          className={
                            (modal ? "" : "bg-slate-50 hover:bg-slate-100") +
                            ` p-4 rounded-lg border-2 cursor-pointer transition-all duration-200  ${
                              field.value === "Instructor"
                                ? "border-primary shadow-lg"
                                : ""
                            }`
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-full ${
                                field.value === "Instructor"
                                  ? "bg-primary text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3
                                  className={
                                    (modal ? "text-white" : "text-slate-900") +
                                    " font-medium "
                                  }
                                >
                                  Instructor
                                </h3>
                                {field.value === "Instructor" && (
                                  <UserCheck className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p
                                className={
                                  (modal ? "text-white" : "text-slate-600") +
                                  " text-xs mt-1"
                                }
                              >
                                Publish courses, share expertise, and also learn
                                as a student.
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Validation Error */}
                      </div>

                      {fieldState.error && (
                        <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
                          <ErrorIcon
                            fontSize="small"
                            className="mr-[8px] text-[16px] text-[#b71000]"
                          />
                          {fieldState?.error.message?.toString()}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Terms and Privacy */}
              <Controller
                name="agreeToTerms"
                control={control}
                rules={{ required: "Please accept the terms and conditions" }}
                render={({ field, fieldState }) => (
                  <>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 border-slate-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor="terms"
                        className={
                          modal
                            ? "text-white"
                            : "text-slate-700" +
                              " text-sm leading-relaxed cursor-pointer"
                        }
                      >
                        I agree to the{" "}
                        <Link
                          href="#" //"/terms"
                          className="text-primary hover:underline font-medium"
                        >
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="#" //"/privacy"
                          className="text-primary hover:underline font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {fieldState.error && (
                      <p className="mt-[8px] flex items-center text-[14px] font-medium leading-[20px] text-[#b71000]">
                        <ErrorIcon
                          fontSize="small"
                          className="mr-[8px] text-[16px] text-[#b71000]"
                        />
                        {fieldState?.error.message?.toString()}
                      </p>
                    )}
                  </>
                )}
              />

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                disabled={isPending}
              >
                Sign Up
              </Button>
            </form>

            {(!modal || true) && (
              <>
                {/* Divider */}
                <div className="relative">
                  <Separator className="bg-slate-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-slate-500">
                    or
                  </span>
                </div>

                {/* Social Sign Up */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-lg transition-all duration-200"
                    onClick={() => router.push(AuthUrl)}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </Button>

                  {/* <Button
                variant="outline"
                className="w-full h-12 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-lg transition-all duration-200"
                onClick={() => console.log("Microsoft sign up")}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M13 1h10v10H13z" />
                  <path fill="#05a6f0" d="M1 13h10v10H1z" />
                  <path fill="#ffba08" d="M13 13h10v10H13z" />
                </svg>
                Sign up with Microsoft
              </Button> */}
                </div>
              </>
            )}

            {/* Login Link */}
            <div className="text-center pt-2">
              <p
                className={
                  (modal ? "text-white" : "text-slate-600") + " text-sm"
                }
              >
                Already have an account?{" "}
                <Link
                  href={modal ? "#" : "/login"}
                  onClick={() => modal && setLogin(true)}
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Log in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
