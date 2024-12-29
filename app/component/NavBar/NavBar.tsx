"use client";
import React from 'react';
import {useSession} from "next-auth/react";
import SignInButton from "@/app/component/Buttons/SignInButton";
import SignOutButton from "@/app/component/Buttons/SignOutButton";

const NavBar = () => {
    const {data: session} = useSession();

    if (!session) {
        return (
            <div className="flex justify-between items-center">
                <h1>WhoSavedMyPlaylist</h1>
                <SignInButton />
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center">
            <h1>WhoSavedMyPlaylist</h1>
            <div className="flex flex-row gap-6">
                <h1>Welcome!</h1>
                <SignOutButton />
            </div>
        </div>
    )
}
export default NavBar
