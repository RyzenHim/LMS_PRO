import React from 'react'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
    return (
        <div>
<h1>This is layout page of the admin</h1>

            <Outlet />


        </div>
    )
}

export default AdminLayout