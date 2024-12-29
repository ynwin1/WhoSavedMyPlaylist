"use client";
import React from 'react'
import {signIn} from "next-auth/react";

const SignInButton = () => {
    return (
        <button
            onClick={() => signIn("spotify", {callbackUrl: "/dashboard"})}
            className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
        >
            Sign in
        </button>
    )
}
export default SignInButton;
