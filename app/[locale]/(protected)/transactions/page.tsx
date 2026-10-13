"use client";

import React, { useState } from "react";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import Filters from "./Filters";
import TransactionTable from "./transactionTable";

function page() {
  const [filterQuery, setFilterQuery] = useState("");
  const [counts, setCounts] = useState({
    paidCount: 0,
    netAmount: 0,
    failedCount: 0,
  });
  const transaction = [
    {
      title: "Net Revenue",
      count: `$${counts.netAmount}`,
    },
    {
      title: "Paid Transactions",
      count: counts.paidCount,
    },
    {
      title: "Failed Transactions",
      count: counts.failedCount,
    },
  ];

  return (
    <>
      <SiteBreadcrumb />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-default-900">
              Transactions
            </h1>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transaction.map((payout, index) => (
            <Card
              key={index}
              className="p-6 text-start flex flex-col items-center justify-between space-y-2"
            >
              <div className="flex w-full items-center justify-between ">
                <p className="text-lg font-semibold">{payout.title}</p>
                <span className="text-xl font-semibold">{payout.count}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* FILTERS */}
            <Filters setFilterQuery={setFilterQuery} />
            {/* TRANSACTIONS TABLE */}
            <TransactionTable filterQuery={filterQuery} setCounts={setCounts} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default page;
