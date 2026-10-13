import React from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import AdminPermission from './AdminPermission'

function AdminRolePermissionPage() {
    return (
        <>
            <SiteBreadcrumb />
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-0">
                        <AdminPermission />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default AdminRolePermissionPage;