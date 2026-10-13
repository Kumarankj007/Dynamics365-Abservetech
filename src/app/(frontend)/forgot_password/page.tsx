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
import InputCard from "@/core/components/InputCard";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";

const ForgotPassword = () => {
  const router = UseLoadingRouter();
  const apiCall = async (data: any) => {
    return await Request(APICONSTANT.forgotPassword, "POST", data);
  };
  const { trigger, isPending } = useCustomMutation(apiCall, {
    onSuccessCallback: (data: any) => {
      if (data?.status) {
        router.push("/");
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
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-white">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <InputCard
                name="email"
                label="Email"
                  iconName="CiMail"
                  iconLib="ci"
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
            <Button
              type="submit"
              disabled={isPending}
              className={(isPending ? "opacity-50" : "") + " w-full"}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
