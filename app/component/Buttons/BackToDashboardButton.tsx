"use client";
import React from 'react'
import {useScreenSizeLimits} from "@/app/component/Pagination/ItemsPerPageSelector";
import {redirect} from "next/navigation";

const BackToDashboardButton = () => {
    const limit = useScreenSizeLimits()[0];
    return (
        <button
            onClick={() => redirect(`/dashboard?page=1&limit=${limit}`)}
            className="self-center text-white bg-spotify hover:bg-green-800 rounded-full px-4 py-2 cursor-pointer"
        >
            Back to Dashboard
        </button>
    )
}
export default BackToDashboardButton
