import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import User from "@/app/model/User";
import Playlist from "@/app/model/Playlist";
import PlaylistCard from "@/app/component/Playlist/PlaylistCard";
import connectDB from "@/app/lib/mongodb";
import Link from "next/link";
import {Music2, PlayCircle} from "lucide-react";

type User = {
    id: string;
    name: string;
    image: string;
    playlists: Playlist[];
}

type UserDB = {
    id: string;
    name: string;
    image: string;
    playlists: string[];
}

export type Playlist = {
    id: string;
    user_created: boolean;
    name: string;
    image: string;
    followers_count: number;
}

type PlaylistDB = {
    id: string;
    user_created: boolean;
    name: string;
    image: string;
    followers_count: number;
    followers: string[];
}

export default async function Page() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    const user: User = {
        id: session.user?.id as string,
        name: session.user?.name as string,
        image: session.user?.image as string,
        playlists: []
    };

    const headers = {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
    }

    let ownedPlaylists: Playlist[] = [];

    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
            headers: headers
        });

        const data = await response.json();
        const public_playlists = data.items.filter((playlist: any) => playlist.public);
        const playlist_ids = public_playlists.map((playlist: any) => playlist.id);

        const playlistPromises = playlist_ids.map(async (id: string) => {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
                headers: headers
            });
            const playlist_data = await response.json();
            // console.log(`Playlist name: ${playlist_data.name} & followers: ${playlist_data.followers.total}`);
            const playlist: Playlist = {
                id: playlist_data.id,
                user_created: playlist_data.owner.id === user.id,
                name: playlist_data.name,
                image: playlist_data.images[0]?.url,
                followers_count: playlist_data.followers.total
            }
            return playlist;
        });
        user.playlists = await Promise.all(playlistPromises);
        ownedPlaylists = user.playlists.filter(playlist => playlist.user_created).sort((a, b) => b.followers_count - a.followers_count);

        await connectDB();
        // create or update user in the database
        let userForDB: UserDB = {
            id: user.id,
            name: user.name,
            image: user.image,
            playlists: []
        }
        userForDB.playlists = user.playlists.map(playlist => playlist.id);
        await User.updateOne({ id: user.id }, userForDB, { upsert: true });

        // create or update subscribed playlists in the database
        const playlistsForDB: PlaylistDB[] = user.playlists.map(playlist => ({
            id: playlist.id,
            user_created: playlist.user_created,
            name: playlist.name,
            image: playlist.image,
            followers_count: playlist.followers_count,
            followers: []
        }));
        for (const playlist of playlistsForDB) {
            if (playlist.user_created) {
                await Playlist.updateOne(
                    { id: playlist.id },
                    {
                        $set: {
                            id: playlist.id,
                            name: playlist.name,
                            image: playlist.image,
                            followers_count: playlist.followers_count,
                        }
                    },
                    { upsert: true }
                );
            } else {
                await Playlist.updateOne(
                    { id: playlist.id },
                    {
                        $addToSet : {followers: user.id },
                        $setOnInsert: {
                            id: playlist.id,
                            name: playlist.name,
                            image: playlist.image,
                            followers_count: playlist.followers_count
                        }
                    },
                    { upsert: true });
            }
        }
    } catch (e) {
        console.error("Error fetching user playlists:", e);
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header Section with fixed height */}
            <div className="bg-spotify h-[15vh] xl:h-[20vh] w-full" />

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-6 relative">
                {/* Profile Section - Overlapping with header */}
                <div className="flex flex-col items-center -mt-16 mb-12">
                    <img
                        src={session.user?.image || ''}
                        alt="user image"
                        className="rounded-full h-32 w-32 ring-4 ring-black border-4 border-white shadow-2xl"
                    />
                    <h1 className="text-3xl font-bold text-white mt-6">
                        {`Howdy, ${session.user?.name}`}
                    </h1>
                    <div className="bg-white/10 px-6 py-2 rounded-full mt-4 border-2 border-spotify">
                        <p className="text-white/90">
                            {`${ownedPlaylists.length} Created Playlists`}
                        </p>
                    </div>
                </div>

                {/* Playlists Section */}
                <div className="mb-20">
                    <div className="flex justify-center items-center gap-3 mb-8">
                        <Music2 className="h-7 w-7 text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
                    </div>

                    <div className="w-full max-md:w-[70vw] mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {ownedPlaylists.map((playlist, index) => (
                                <Link
                                    href={`/dashboard/playlist/${playlist.id}`}
                                    key={index}
                                    className="transform transition-all duration-300 hover:-translate-y-1"
                                >
                                    <PlaylistCard
                                        key={index}
                                        name={playlist.name}
                                        image={playlist.image}
                                        followers_count={playlist.followers_count}
                                    />
                                </Link>
                            ))}
                        </div>

                        {/* Empty State */}
                        {ownedPlaylists.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <PlayCircle className="h-16 w-16 text-green-500 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    No Playlists Created Yet
                                </h3>
                                <p className="text-white/60">
                                    Create your first playlist on Spotify to see it here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}