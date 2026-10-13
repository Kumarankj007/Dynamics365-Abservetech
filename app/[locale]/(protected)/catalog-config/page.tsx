import React from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import CategoryList from "./(Category)/CategoryList";
import DurationBandsList from "./(DurationBand)/DurationBandsList";
import SuggestedTagsList from "./(Tags)/SuggestedTagsList";

function page() {
  return (
    <>
      <SiteBreadcrumb />
      <div className="pb-6">
        <p className="text-2xl font-bold text-default-900">
          Catalog Configuration
        </p>
        <p className="text-gray-600">
          Manage course categories, tags, and dropdown options
        </p>
      </div>
      <div className="space-y-12">
        <Card>
          <CardContent className="p-0">
            <CategoryList />
          </CardContent>
        </Card>
        <div className="flex flex-wrap">
          <Card className="lg:w-[49%] w-full lg:mr-[2%]">
            <CardContent className="p-0">
              <DurationBandsList />
            </CardContent>
          </Card>
          <Card className="lg:w-[49%] w-full">
            <CardContent className="p-0">
              <SuggestedTagsList />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default page;
