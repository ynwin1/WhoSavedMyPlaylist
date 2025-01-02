"use client"
import React from 'react'
import {signOut} from "next-auth/react";

async function onSignOut(user_id: string) {
    const response = await fetch(`/api/user/${user_id}/signout`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sign out");
    }

    await signOut({callbackUrl: "/"});
}

const SignOutButton = ({user_id} : {user_id: string}) => {
    return (
        <button
            onClick={() => onSignOut(user_id)}
            className="
            px-4 py-2 rounded-full bg-green-500 hover:bg-green-400 text-white hover:text-black font-medium
                 transform transition-all duration-300
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black
                 border-2 border-white
                 "
        >
            Log Out
        </button>
    )
}
export default SignOutButton;
