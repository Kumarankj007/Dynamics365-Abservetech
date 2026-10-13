/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/core/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import useSnackbarStore from "@/core/store/toaster";
import { useAuthStore } from "@/core/store/authStore";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import InputCard from "@/core/components/InputCard";
import Link from "next/link";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { Separator } from "@/core/components/ui/separator";
import { generateGoogleOAuthUrl } from "@/core/lib/utils";
import { Dispatch, SetStateAction } from "react";

const Login = ({
  modal = false,
  setLogin = () => {},
  onClose = () => {},
}: {
  modal?: boolean;
  onClose?: () => void;
  setLogin?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = UseLoadingRouter();
  const { Settings } = useAuthStore((state) => state);
  const AuthUrl = generateGoogleOAuthUrl(
    Settings?.googleClientId,
    Settings?.baseUrl,
  );
  const { LoginApi } = useAuthStore((state) => state);
  // Ensure LoginApi returns a Promise
  const mutationFn = async (data: any) => {
    return await LoginApi(data);
  };
  const { trigger, isPending } = useCustomMutation(mutationFn, {
    onSuccessCallback: (data: any) => {
      if (data?.status) {
        if (!modal) {
          router.push(
            data?.data?.currentRole == "User" ? "/" : "/instructor/dashboard",
          );
        } else {
          onClose();
        }
      }
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (e: any) => {
    trigger(e);
  };

  return (
    <div
      className={
        (modal ? "rounded-lg py-7" : "min-h-screen py-24 bg-white") +
        " flex flex-col items-center justify-center px-4 "
      }
    >
      <div className="text-center mb-8">
        <div className="space-y-4">
          {!modal && (
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome to Dynamics365 Lab
            </h2>
          )}
          <h1
            className={
              (modal ? "text-white" : "") + " text-3xl font-bold text-slate-900"
            }
          >
            Sign In
          </h1>
          <p
            className={
              modal
                ? "text-white"
                : "text-slate-600" + " text-sm leading-relaxed max-w-sm mx-auto"
            }
          >
            {modal
              ? "We'll create your account during checkout."
              : "Access your courses and continue your Microsoft Dynamics 365 learning journey."}
          </p>
        </div>
      </div>
      <Card className="w-full max-w-md shadow-xl bg-transparent">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="py-6">
            <div className="space-y-2">
              <InputCard
                name="email"
                label="Email"
                iconName="CiMail"
                iconLib="ci"
                dark={modal}
                inputProps={{ autoFocus: true }}
                placeholder="Enter Your Email"
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
                placeholder="Enter the Password"
                required={true}
                type="password"
                dark={modal}
                requiredMsg="Password is required"
                control={control}
                errors={errors}
                // pattern={{
                //   value:
                //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
                //   message:
                //     "Password must be 8–20 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character",
                // }}
              />
            </div>
            {!modal && (
              <div className="text-right">
                <Link
                  href={"/forgot_password"}
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
            <Button
              type="submit"
              disabled={isPending}
              className={(isPending ? "opacity-50" : "") + " w-full"}
            >
              Login
            </Button>
          </form>

          {(!modal || true) && (
            <>
              {/* Divider */}
              <div className="relative mb-7">
                <Separator className="bg-slate-200" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-slate-500">
                  or
                </span>
              </div>

              {/* Social Login */}
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
                  Login with Google
                </Button>

                {/* <Button
                  variant="outline"
                  className="w-full h-12 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-lg transition-all duration-200"
                  onClick={() => console.log("Microsoft login")}
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M13 1h10v10H13z" />
                    <path fill="#05a6f0" d="M1 13h10v10H1z" />
                    <path fill="#ffba08" d="M13 13h10v10H13z" />
                  </svg>
                  Login with Microsoft
                </Button> */}
              </div>
            </>
          )}
          <div className={"mt-6" + " text-center"}>
            <p className="text-sm text-muted-foreground">
              New here?
              <Link
                href={modal ? "#" : "/signup"}
                onClick={() => modal && setLogin(false)}
                className="text-primary hover:underline ml-2"
              >
                Create an account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
