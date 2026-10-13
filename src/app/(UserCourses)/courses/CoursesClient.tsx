/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import CourseCatalogSection from "@/core/components/CourseCatalogSection";
import { Request } from "@/core/utils/apiTools";
import APICONSTANT from "@/core/utils/ApiConstant";
import { useCustomMutation } from "@/core/hooks/useCustomMutation";
import { Button } from "@/core/components/ui/button";
import { ArrowLeft, Search, X } from "lucide-react";
import UseLoadingRouter from "@/core/hooks/useLoadRoute";
import { Input } from "@/core/components/ui/input";

const Courses = () => {
  const route = UseLoadingRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const limit = 9;
  const totalPages = Math.ceil(total / limit);

  const apiCall = async (data: any) => {
    return await Request(APICONSTANT.courseUserOverview, "GET", data);
  };
  const { trigger, isPending } = useCustomMutation(
    apiCall,
    {
      onSuccessCallback: (data: any) => {
        // console.log(data?.data, "data")
        if (data?.status && data?.data) {
          setCourses(data?.data?.data);
          setTotal(data?.data?.total || 0);
        }
      },
    },
    false,
  );

  useEffect(() => {
    trigger({
      limit: limit,
      page: page,
      all: activeTab,
      ...(search == "" ? {} : { search: search }),
    });
  }, [page, activeTab]);

  const filterSearch = (search = "") => {
    setPage(1);
    if (page == 1) {
      trigger({
        limit: limit,
        page: page,
        all: activeTab,
        search: search,
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 ">
      <div className="container mx-auto px-4">
        <header className="flex items-center justify-between">
          {/* Course Header */}
          <Button
            variant="ghost"
            onClick={() => route?.push("/")}
            className="mb-6 text-text-light hover:text-white hover:bg-white/10 border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="relative w-full sm:w-80">
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-16 bg-gray-900 text-white"
            />
            {search != "" && (
              <X
                onClick={() => {
                  setSearch("");
                  filterSearch("");
                }}
                className="absolute right-9 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white"
              />
            )}
            <Search
              onClick={() => {
                filterSearch(search);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white"
            />
          </div>
        </header>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Browse All Courses
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Explore all Dynamics 365 and Power Platform courses in one place —
            new, top-rated, and more.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setPage(1);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="newcourse">New Courses</TabsTrigger>
            <TabsTrigger value="toprated">Top Rated</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <CourseCatalogSection
              courses={courses}
              isPending={isPending}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </TabsContent>

          <TabsContent value="newcourse">
            <CourseCatalogSection
              courses={courses}
              isPending={isPending}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </TabsContent>

          <TabsContent value="toprated">
            <CourseCatalogSection
              courses={courses}
              isPending={isPending}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Courses;
