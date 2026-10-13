'use client';
import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/components/navigation'
import { useSearchParams } from 'next/navigation';

interface props {
    isEditMode?: boolean;
}

function CourseHeader({ isEditMode }: props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = searchParams?.get("page") || 1;

    const handleBackManageCourse = () => {
        router.push(`/manage-courses?page=${page}`);
    }
    
    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <p className="text-2xl font-bold text-default-900">
                        {isEditMode ? "Edit Course" : "Create New Course"}
                    </p>
                    <p className="text-gray-600">
                        {isEditMode
                            ? "Update and manage existing course details"
                            : "Create and publish a new course directly"}
                    </p>
                </div>
                {
                    isEditMode && <div className="flex justify-end w-full md:w-auto">
                        <Button
                            variant="default"
                            className="gap-2 w-full sm:w-auto"
                            onClick={handleBackManageCourse}
                        >
                            Back
                        </Button>
                    </div>
                }
            </div>
        </div>
    )
}

export default CourseHeader
