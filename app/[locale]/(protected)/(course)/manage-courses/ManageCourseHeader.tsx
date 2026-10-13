'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/components/navigation'

function ManageCourseHeader() {
    const router = useRouter();

    const handleCreateNewCourse = () => {
        router.push('/courses');
    }

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
                <p className="text-2xl font-bold text-default-900">Manage Courses</p>
                <p className="text-gray-600">Edit and publish draft courses</p>
            </div>
            <div className="flex justify-end w-full md:w-auto">
                <Button
                    variant="default"
                    className="gap-2 w-full sm:w-auto"
                    onClick={handleCreateNewCourse}
                >
                    Create New Course
                </Button>
            </div>
        </div>
    )
}

export default ManageCourseHeader