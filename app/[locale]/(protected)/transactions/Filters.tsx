"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { APICONSTANT, APIURLS } from "@/services/config";
import axios from "axios";

const Filters = ({ setFilterQuery }: any) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [paymentSource, setPaymentSource] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [renewalMonth, setRenewalMonth] = useState<Date>();
  const [exportBtn, setExportBtn] = useState("");
  const token = localStorage.getItem("token");

  const FilterQuery = () => {
    let query = "";
    if (dateFrom) {
      const fromDateStr = format(dateFrom, "yyyy-MM-dd");
      query += `&fromDate=${fromDateStr}`;
    }
    if (dateTo) {
      const toDateStr = format(dateTo, "yyyy-MM-dd");
      query += `&toDate=${toDateStr}`;
    }
    if (paymentSource && paymentSource !== "all") {
      query += `&paymentSource=${paymentSource}`;
    }
    if (statusFilter && statusFilter !== "all") {
      query += `&status=${statusFilter}`;
    }
    if (renewalMonth) {
      const renewalMonthStr = format(renewalMonth, "yyyy-MM-dd");
      query += `&renewalMonth=${renewalMonthStr}`;
    }
    setFilterQuery(query);
  };

  useEffect(() => {
    FilterQuery();
  }, [dateFrom, dateTo, paymentSource, statusFilter, renewalMonth]);

  const handleExport = async () => {
    try {
      const url = `${APIURLS.baseUrl}${APICONSTANT.EXPORT_TRANSACTIONS}?export=${exportBtn}`;

      const response: any = await axios({
        url,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      // Extract filename
      const cd = response.headers["content-disposition"];
      let fileName = `export.${exportBtn === "csv" ? "csv" : "xlsx"}`;

      if (cd) {
        const match = cd.match(/filename="?(.+)"?/);
        if (match) fileName = match[1];
      }

      // Download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  useEffect(() => {
    if (exportBtn) {
      handleExport();
    }
  }, [exportBtn]);

  const handleClear = () => {
    setRenewalMonth(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setPaymentSource("All");
    setStatusFilter("All");
    setRenewalMonth(undefined);
  };

  return (
    <>
      {/* <div className="flex flex-wrap gap-4"> */}
      <div className="w-full grid grid-cols-1 md:flex md:flex-wrap md:gap-4 space-y-2 md:space-y-0">
        {/* Date Range */}
        <div className="flex flex-col md:flex-row items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="md"
                className={cn(
                  "w-full md:w-auto justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="md"
                className={cn(
                  "w-full md:w-auto justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Payment Source Filter */}
        <Select value={paymentSource} onValueChange={setPaymentSource}>
          <SelectTrigger size="md" className="w-full md:w-40">
            <SelectValue placeholder="Payment Source" />
          </SelectTrigger>
          <SelectContent className="w-auto">
            <SelectItem value="All">All Sources</SelectItem>
            <SelectItem value="Stripe">Stripe</SelectItem>
            {/* <SelectItem value="Razorpay">Razorpay</SelectItem> */}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="md" className="w-full md:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="w-auto">
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Renewal Month Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="md"
              className={cn(
                "w-full md:w-48 justify-start text-left font-normal",
                !renewalMonth && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {renewalMonth
                ? format(renewalMonth, "MMMM yyyy")
                : "Renewal month"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={renewalMonth}
              onSelect={setRenewalMonth}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {(dateFrom ||
          dateTo ||
          paymentSource !== "All" ||
          statusFilter !== "All" ||
          renewalMonth) && (
          <Button
            variant="ghost"
            size="md"
            onClick={handleClear}
            className="w-full md:w-auto text-muted-foreground"
          >
            X
          </Button>
        )}

        <div className="ml-auto w-full md:w-auto">
          <Select value={exportBtn} onValueChange={setExportBtn}>
            <SelectTrigger size="md" className="w-full md:w-32">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent className="w-auto">
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">EXCEL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default Filters;
