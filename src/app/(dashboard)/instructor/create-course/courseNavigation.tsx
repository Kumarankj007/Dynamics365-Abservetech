/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { TabsContent } from "@/core/components/ui/tabs";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";

export default function CourseNavigation({
  isPending = false,
  tabValue = "",
  isPreview = false,
  handleTabNavigation = () => {},
  handleSubmit = () => {},
  finalBtn = false,
  courseId = "",
  children,
}: {
  isPending?: boolean;
  tabValue?: string;
  isPreview?: boolean;
  handleTabNavigation?: (str: "prev" | "next") => void;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  finalBtn?: boolean;
  courseId?: string;
  children: React.ReactNode;
}) {
  const router = UseLoadingRouter();
  const firstTab = tabValue == "course-title";
  const lastTab = tabValue == "submit";
  const apiCall = async (data: any) => {
    return await Request(`${APICONSTANT.submit}/${courseId}`, "PUT", data);
  };

  const { trigger, isPending: isFinalSubmitPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data, "data");
        if (data?.success) {
          router?.push("/instructor/courses");
        }
      },
    }
  );
  const handleFinalSubmit = () => {
    trigger({});
  };

  // console.log(isPending, finalBtn, isFinalSubmitPending, "btdn");
  return isPreview ? (
    children
  ) : (
    <>
      <TabsContent value={tabValue}>
        <form onSubmit={handleSubmit}>
          <Card className="bg-card border border-t-0 rounded-t-none  shadow-card">
            <CardContent className="p-0">
              <div className="p-8">
                <div className="mt-0 space-y-6">{children}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-t bg-card mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {!firstTab && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTabNavigation("prev")}
                    disabled={firstTab}
                  >
                    <ChevronLeft className="w-4 h-4 " />
                    Back
                  </Button>
                )}

                <div
                  className={
                    (isPending || isFinalSubmitPending ? "opacity-65" : "") +
                    " flex items-center gap-3 ml-auto"
                  }
                >
                  {lastTab ? (
                    <Button
                      type="button"
                      disabled={isPending || isFinalSubmitPending || !finalBtn}
                      onClick={handleFinalSubmit}
                    >
                      <Send className={" w-4 h-4 mr-2"} />
                      Review & Submit
                    </Button>
                  ) : (
                    <>
                      {!(firstTab && courseId != "") && (
                        <Button
                          variant="outline"
                          name="action"
                          value="save"
                          type="submit"
                          disabled={isPending}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Draft
                        </Button>
                      )}
                      {!(firstTab && courseId != "") && (
                        <Button
                          name="action"
                          value="continue"
                          type="submit"
                          disabled={isPending}
                        >
                          {isPending ? "Submiting..." : "Save"}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        disabled={lastTab}
                        onClick={() => handleTabNavigation("next")}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </TabsContent>
    </>
  );
}
