"use client"
import React from 'react'
import {signOut} from "next-auth/react";

const SignOutButton = () => {
    return (
        <button
            onClick={() => signOut({callbackUrl: "/"})}
            className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
        >
            Sign Out
        </button>
    )
}
export default SignOutButton;
