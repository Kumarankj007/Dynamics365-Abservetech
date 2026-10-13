'use client'
import React, { useState } from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, CreditCard, DollarSign, Download, Filter } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PayoutTabs from './payoutTabs'
import PayoutRequest from './PayoutRequest'
import AdminApproval from './AdminApproval'
import { priceFormat } from '@/lib/utils'


function page() {
  const [payoutOverview, setPayoutOverview] = useState([
    { title: "Available to Pay", count: "$0", desc: "Sum of all requested amounts" },
    { title: "Requests in Queue", count: 0, desc: "Requested + Processing" },
    { title: "Requested", count: 0, desc: "Awaiting action" },
    { title: "Processing", count: 0, desc: "Payment in progress" },
  ])

  const getIcon = (title: string) => {
    switch (title) {
      case "Available to Pay":
        return <DollarSign size={24} className="text-muted-foreground" />
      case "Requests in Queue":
        return <Clock size={24} className="text-muted-foreground" />
      case "Requested":
        return <Clock size={24} className="text-muted-foreground" />
      case "Processing":
        return <CreditCard size={24} className="text-muted-foreground" />
      default:
        return null;
    }
  };

  return (
    <>
      <SiteBreadcrumb />
      <div className='space-y-6'>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-default-900">Payout Requests</h1>
            <p className="text-gray-600">Manage instructor payout requests and payments</p>
          </div>

          <div className="flex flex-col md:flex-row items-center md:justify-end gap-3">

            <div className="flex flex-row items-center gap-2 md:gap-3">
              <Badge
                color="secondary"
                rounded="full"
                className="text-xs sm:text-sm text-default-900 flex items-center w-full sm:w-auto justify-center"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Available to Pay: {payoutOverview[0].count}
              </Badge>

              <Badge
                color="secondary"
                rounded="full"
                className="text-xs sm:text-sm text-default-900 flex items-center w-full sm:w-auto justify-center"
              >
                <Clock className="w-4 h-4 mr-1" />
                Pending Items: {payoutOverview[1].count}
              </Badge>
            </div>

            {/* <div className="flex flex-row items-center gap-3">
              <Button type="button" variant="outline" className="flex items-center w-full sm:w-auto justify-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>

              <Button type="button" variant="outline" className="flex items-center w-full sm:w-auto justify-center">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div> */}
          </div>
        </div>

        {/* ALERT */}
        <Alert color='secondary' className='border-2'>
          <AlertTriangle size={24} />
          <AlertDescription>
            Minimum payout request is $50 available balance. Payouts are processed within 5-7 business days.
          </AlertDescription>
        </Alert>

        {/* STATES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {payoutOverview.map((payout, index) => (
            <Card key={index} className="p-6 text-start flex flex-col items-center justify-between space-y-2">
              <div className=" flex w-full items-center justify-between ">
                <p className="text-lg font-semibold">{payout.title}</p>
                {getIcon(payout.title)}
              </div>
              <div className='w-full flex flex-col items-start gap-2'>
                <div className="text-2xl font-semibold">{payout.count}</div>
                <p className="text-md text-gray-600">{payout.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* TAPS */}
        {/* <PayoutTabs /> */}
        <Card>
          <AdminApproval setPayoutOverview={setPayoutOverview} />
        </Card>
        <Card>
          <PayoutRequest setPayoutOverview={setPayoutOverview} />
        </Card>

      </div>
    </>
  )
}

export default page
