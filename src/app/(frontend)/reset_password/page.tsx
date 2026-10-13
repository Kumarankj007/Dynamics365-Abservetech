/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/core/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import InputCard from "@/core/components/InputCard";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useSearchParams } from "next/navigation";

const ResetPassword = () => {
  const router = UseLoadingRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  // console.log("token", token)
  const apiCall = async (data: any) => {
    return await Request(APICONSTANT.resetPassword, "POST", data);
  };
  const { trigger, isPending } = useCustomMutation(apiCall, {
    onSuccessCallback: (data: any) => {
      if (data?.status) {
        router.push("/login");
      }
    },
  });

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const onSubmit = async (e: any) => {
    const obj = {
      token: token || '',
      newPassword: e.newPassword,
    }
    trigger(obj);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-white">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <InputCard
                name="newPassword"
                label="New Password"
                placeholder="Enter the Password"
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
            <div className="space-y-2">
              <InputCard
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter the Password"
                type="password"
                required={true}
                requiredMsg="Confirm Password is required"
                control={control}
                errors={errors}
                getValues={getValues}
                // validate={(value: string) => {
                //   console.log(value, "value");
                //   return (
                //     value === getValues("newPassword") ||
                //     "Passwords do not match"
                //   );
                // }}
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className={(isPending ? "opacity-50" : "") + " w-full"}
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
