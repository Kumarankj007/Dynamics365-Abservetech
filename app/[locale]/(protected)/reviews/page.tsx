import React from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import ReviewList from './ReviewList'

function page() {
  return (
    <>
      <SiteBreadcrumb />
      <div className="space-y-6">
        <Card>
          <CardContent className="p-0">
            <ReviewList />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default page