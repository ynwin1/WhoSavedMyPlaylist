"use client";
import React from 'react';
import {useSession} from "next-auth/react";
import {redirect} from "next/navigation";
import SignOutButton from "@/app/component/Buttons/SignOutButton";

const Page = () => {
    const {data: session, status} = useSession();

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!session) {
        // redirect to home page
        redirect("/");
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
            <img src={session?.user?.image} alt="user image" className="rounded-full h-24 w-24" />
            <h1 className="text-3xl font-bold text-white">
                {`Welcome, ${session?.user?.name}!`}
            </h1>
            <SignOutButton />
        </div>
    )
}
export default Page
