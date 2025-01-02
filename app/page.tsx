import React from 'react';
import SignInButton from '@/app/component/Buttons/SignInButton';
import {Users, Lock, PersonStanding, HandHeart} from 'lucide-react';
import FeatureCard from '@/app/component/Home/FeatureCard';
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import DashboardButton from "@/app/component/Buttons/DashboardButton";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Home | WhoSavedMyPlaylist',
    description: 'Find out who saved your Spotify playlists.',
    openGraph: {
        title: 'WhoSavedMyPlaylist',
        description: 'Find out who saved your Spotify playlists.',
        images: [{
            url: '/home.png',
            width: 800,
            height: 600,
            alt: 'WhoSavedMyPlaylist',
        }],
        type: 'website',
        siteName: 'WhoSavedMyPlaylist'
    }
}

export default async function Page() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4">
                <div className="absolute inset-0 bg-spotify/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />

                <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl font-bold max-md:text-3xl bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                        WhoSavedMyPlaylist
                    </h1>
                    <p className="text-xl text-white/80 max-w-xl mx-auto max-md:text-base">
                        Discover who's enjoying your musical taste.
                    </p>
                    {session ?
                        <DashboardButton/>
                        :
                        <SignInButton />
                    }
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FeatureCard
                        icon={<Users className="h-8 w-8 text-green-500" />}
                        title="See Your Followers"
                        description="Find out who saved your playlists and connect with fellow music lovers."
                    />
                    <FeatureCard
                        icon={<PersonStanding className="h-8 w-8 text-green-500" />}
                        title="The 'You' Perspective"
                        description="Only you can see who saved your playlists. No one else."
                    />
                    <FeatureCard
                        icon={<HandHeart className="h-8 w-8 text-green-500" />}
                        title="Give & Take"
                        description="You get to see who saved your playlists and others get to see who saved theirs."
                    />
                    <FeatureCard
                        icon={<Lock className="h-8 w-8 text-green-500" />}
                        title="Secure & Private"
                        description="Safe authentication through Spotify. Your data stays protected."
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center text-white">
                <p>Connect with Spotify to get started</p>
            </footer>
        </div>
    );
}