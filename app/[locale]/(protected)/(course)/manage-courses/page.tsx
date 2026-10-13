import React from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import ManageCourseList from './ManageCourseList'
import ManageCourseHeader from './ManageCourseHeader';

function page() {
  return (
    <>
      <SiteBreadcrumb />
      <div className="space-y-6">
        <ManageCourseHeader />
        <Card>
          <CardContent className="p-0">
            <ManageCourseList />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default page