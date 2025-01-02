"use client"
import React from 'react'
import {User} from "@/app/dashboard/(dashboard)/page";
import {refreshDashboard} from "@/app/lib/actions";

const DashboardRefreshButton = ({user, headers} : {user: User, headers: any}) => {
    return (
        <form action={async () => {
            await refreshDashboard(user, headers);
            window.location.reload();
        }}>
            <button type="submit" className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-400 text-white hover:text-black font-medium
                 transform transition-all duration-300
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black
                 border-2 border-white mt-6">
                Refresh
            </button>
        </form>
    )
}
export default DashboardRefreshButton
