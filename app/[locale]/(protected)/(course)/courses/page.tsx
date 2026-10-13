import React from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import CreateCourse from './CreateCourse'
import CourseHeader from './CourseHeader'

interface PageProps {
  searchParams: { id?: string }
}

function page({ searchParams }: PageProps) {
  const courseId = searchParams?.id
  const isEditMode = !!courseId
  return (
    <>
      <SiteBreadcrumb />
      <div className="space-y-6">
        <CourseHeader isEditMode={isEditMode} />
        <CreateCourse editCourseId={courseId} />
      </div>
    </>
  )
}

export default page

// 'use client'
// import React from 'react'
// import SiteBreadcrumb from '@/components/site-breadcrumb'
// import CreateCourse from './CreateCourse'
// import { useSearchParams } from 'next/navigation'

// function Page() {
//   const searchParams = useSearchParams()
//   const courseId = searchParams?.get("id")

//   const isEditMode = !!courseId

//   return (
//     <>
//       <SiteBreadcrumb />
//       <div className="space-y-6">
//         <div>
//           <p className="text-2xl font-bold text-default-900">
//             {isEditMode ? "Edit Course" : "Create New Course"}
//           </p>
//           <p className="text-gray-600">
//             {isEditMode
//               ? "Update and manage existing course details"
//               : "Create and publish a new course directly"}
//           </p>
//         </div>

//         <CreateCourse courseId={courseId} />
//       </div>
//     </>
//   )
// }

// export default Page