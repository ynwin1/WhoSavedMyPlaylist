"use client";
import React from 'react';
import {useSession} from "next-auth/react";
import SignInButton from "@/app/component/Buttons/SignInButton";
import { Music2 } from 'lucide-react';
import Link from "next/link";
import SignOutButton from "@/app/component/Buttons/SignOutButton";

const NavBar = () => {
    const {data: session} = useSession();

    return (
        <nav className="fixed top-0 z-50 w-full backdrop-blur-md bg-black/30 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-full bg-green-500 group-hover:bg-green-400 transition-colors duration-300">
                            <Music2 className="h-5 w-5 text-black" />
                        </div>
                        <h1 className="hidden md:block text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300 max-md:text-lg">
                            WhoSavedMyPlaylist
                        </h1>
                    </Link>

                    {!session ? (
                        <SignInButton />
                    ) : (
                        <div className="flex items-center gap-4">
                            {session.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    className="hidden md:block w-8 h-8 rounded-full ring-2 ring-white/20 hover:ring-green-500 transition-all duration-300"
                                />
                            )}
                            <span className="hidden md:block text-white/80 hover:text-white transition-colors duration-300">
                                {session.user?.name}
                            </span>
                            <SignOutButton />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
export default NavBar
