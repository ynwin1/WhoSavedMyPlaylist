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
            <button type="submit" className="bg-spotify text-white rounded-2xl ring-2 px-4 py-2 mt-6 hover:bg-green-800 ring-white transition-all duration-300">
                Refresh
            </button>
        </form>
    )
}
export default DashboardRefreshButton
