import React from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import EnrollmentList from './EnrollmentList'

function page() {
  return (
    <>
      <SiteBreadcrumb />
      <div className="space-y-6">
        <Card>
          <CardContent className="p-0">
            <EnrollmentList />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default page