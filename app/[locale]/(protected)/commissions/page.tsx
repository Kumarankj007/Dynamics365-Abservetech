import React from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import CommissionsList from './CommissionsList'

function page() {
  return (
    <>
      <SiteBreadcrumb />
      <div className="pb-6">
        <p className="text-2xl font-bold text-default-900">
          Commissions
        </p>
        <p className="text-gray-600">
          Set the default platform/instructor split and instructor-specific overrides.
        </p>
      </div>
      <div className="space-y-12">
        <CommissionsList />
      </div>
    </>
  )
}

export default page
