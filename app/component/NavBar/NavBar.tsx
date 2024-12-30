"use client";
import React from 'react';
import {useSession} from "next-auth/react";
import SignInButton from "@/app/component/Buttons/SignInButton";
import SignOutButton from "@/app/component/Buttons/SignOutButton";
import Link from "next/link";

const NavBar = () => {
    const {data: session} = useSession();

    const navClass = "flex justify-between items-center p-4 bg-gray-800 text-white";
    const titleClass = "text-2xl max-md:text-xl on-hover:cursor-pointer on-hover:text-blue-600";

    if (!session) {
        return (
            <div className={navClass}>
                <Link href="/">
                    <h1 className={titleClass}>WhoSavedMyPlaylist</h1>
                </Link>
                <SignInButton />
            </div>
        );
    }

    return (
        <div className={navClass}>
            <Link href="/">
                <h1 className={titleClass}>WhoSavedMyPlaylist</h1>
            </Link>
            <div className="flex flex-row items-center gap-6">
                <h1>Welcome!</h1>
                <SignOutButton />
            </div>
        </div>
    )
}
export default NavBar
