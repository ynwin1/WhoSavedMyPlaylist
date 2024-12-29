'use client';
import {signIn, signOut, useSession} from "next-auth/react";

export default function Home() {
  const {data: session, status} = useSession();

    // Show loading state
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
                <h1 className="text-3xl font-bold text-white">
                    Welcome to WhoSavedMyPlaylist?
                </h1>
                <button
                    onClick={() => signIn("spotify")}
                    className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
                >
                    Sign in with Spotify
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
            <h1 className="text-3xl font-bold text-white">
                Welcome!
            </h1>
            <button
                onClick={() => signOut()}
                className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
            >
                Log out
            </button>
        </div>
    );
}
