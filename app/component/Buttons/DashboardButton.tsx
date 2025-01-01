"use client";
import React from 'react'
import {redirect} from "next/navigation";

const DashboardButton = () => {
    return (
        <button
            onClick={() => redirect("/dashboard")}
            className="
            px-4 py-2 rounded-full bg-green-500 hover:bg-green-400 text-white hover:text-black font-medium
                 transform transition-all duration-300 hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black
                 border-2 border-white
                 "
        >
            Go to Dashboard
        </button>
    )
}
export default DashboardButton
