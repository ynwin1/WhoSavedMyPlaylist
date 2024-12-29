"use client";
import React from 'react';
import {signIn, signOut, useSession} from "next-auth/react";

const NavBar = () => {
    const {data: session} = useSession();

    if (!session) {
        return (
            <div className="flex justify-between items-center">
                <h1>WhoSavedMyPlaylist?</h1>
                <button
                    onClick={() => signIn("spotify")}
                    className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
                >
                    Sign in
                </button>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center">
            <h1>WhoSavedMyPlaylist?</h1>
            <div className="flex flex-row gap-6">
                <h1>Welcome!</h1>
                <button
                    onClick={() => signOut()}
                    className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-color"
                >
                    Log out
                </button>
            </div>
        </div>
    )
}
export default NavBar
