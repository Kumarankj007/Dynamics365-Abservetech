'use client'
import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminApproval from './AdminApproval'
import PayoutRequest from './PayoutRequest'

const PayoutTabs = () => {
    const [tab, setTab] = useState("admin")

    return (
        <Card className='p-6'>
            <Tabs
                value={tab}
                onValueChange={(value) => {
                    setTab(value)
                }}
            >
                <TabsList className="flex md:grid md:grid-cols-2 w-full overflow-x-auto whitespace-nowrap">
                    <TabsTrigger value="admin">Admin Approval Queue</TabsTrigger>
                    <TabsTrigger value="payout">
                        Payout Requests (5)
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="admin" forceMount>
                    <AdminApproval />
                </TabsContent>
                <TabsContent value="payout" forceMount>
                    <PayoutRequest />
                </TabsContent>
            </Tabs>
        </Card>
    )
}

export default PayoutTabs