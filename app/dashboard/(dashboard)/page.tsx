import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import User from "@/app/model/User";
import Playlist from "@/app/model/Playlist";
import PlaylistCard from "@/app/component/Playlist/PlaylistCard";
import connectDB from "@/app/lib/mongodb";
import Link from "next/link";
import {Music2, PlayCircle} from "lucide-react";
import {Metadata} from "next";
import DashboardRefreshButton from "@/app/component/Buttons/DashboardRefreshButton";
import {playlistPaginationLimit} from "@/app/lib/utils";
import FollowersPagination from "@/app/component/Pagination/FollowersPagination";

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Your personal dashboard to see followers on your Spotify playlists.'
}

type DashboardPageProps = {
    searchParams: Promise<{page?: number}>;
}

export type User = {
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
    isLoggedIn: true;
}

export type Playlist = {
    id: string;
    owner_id: string;
    name: string;
    image: string;
    followers_count: number;
}

type PlaylistDB = {
    id: string;
    owner_id: string;
    name: string;
    image: string;
    followers_count: number;
    followers: string[];
}

async function fetchFromDatabase(user_id: string, allPlaylists: string[]) {
    console.log("Fetching from database");
    const playlists = [];
    for (const id of allPlaylists) {
        const playlistFromDB = await Playlist.findOne({id: id});
        if (!playlistFromDB) {
            return undefined;
        }
        const playlist: Playlist = {
            id: playlistFromDB.id,
            owner_id: playlistFromDB.owner_id,
            name: playlistFromDB.name,
            image: playlistFromDB.image,
            followers_count: playlistFromDB.followers_count
        }
        playlists.push(playlist);
    }
    return playlists;
}

export async function fetchFromSpotify(user: User, headers: any) {
    console.log("Fetching from SPOTIFY API");
    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
            headers: headers
        });

        const data = await response.json();
        // only interested in public playlists
        const public_playlists = data.items.filter((playlist: any) => playlist.public);
        const playlist_ids = public_playlists.map((playlist: any) => playlist.id);

        // get more details of each playlist
        const playlistPromises = playlist_ids.map(async (id: string) => {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
                headers: headers
            });
            const playlist_data = await response.json();
            // console.log(`Playlist name: ${playlist_data.name} & followers: ${playlist_data.followers.total}`);
            const playlist: Playlist = {
                id: playlist_data.id,
                owner_id: playlist_data.owner.id,
                name: playlist_data.name,
                image: playlist_data.images[0]?.url,
                followers_count: playlist_data.followers.total
            }
            return playlist;
        });
        user.playlists = await Promise.all(playlistPromises);

        await connectDB();
        // create or update user in the database
        let userForDB: UserDB = {
            id: user.id,
            name: user.name,
            image: user.image,
            playlists: [],
            isLoggedIn: true
        }
        userForDB.playlists = playlist_ids;
        await User.updateOne({ id: user.id }, userForDB, { upsert: true });

        // create or update playlists in the database
        const playlistsForDB: PlaylistDB[] = user.playlists.map(playlist => ({
            id: playlist.id,
            owner_id: playlist.owner_id,
            name: playlist.name,
            image: playlist.image,
            followers_count: playlist.followers_count,
            followers: []
        }));
        const insertedPlaylists = playlistsForDB.map(async (playlist) => {
            await Playlist.updateOne(
                { id: playlist.id },
                {
                    $set: {
                        id: playlist.id,
                        owner_id: playlist.owner_id,
                        name: playlist.name,
                        image: playlist.image,
                        followers_count: playlist.followers_count,
                    },
                    ...(playlist.owner_id !== user.id && {
                        $addToSet: { followers: user.id },
                    }),
                },
                { upsert: true }
            );
            return user.playlists;
        });
        await Promise.all(insertedPlaylists);

        return user.playlists;
    } catch (e) {
        console.error("Error fetching user playlists:", e);
    }
}

export default async function Page({ searchParams }: DashboardPageProps) {
    const session = await getServerSession(authOptions);
    const { page } = await searchParams;

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
        await connectDB();
        const userFromDB = await User.findOne({ id: user.id });
        if (userFromDB && userFromDB.isLoggedIn) {
            // called whenever user navigates to dashboard after logging in (no need to fetch from Spotify)
            const allUserPlaylistIDs: string[] = userFromDB.playlists;
            const userPlaylists = await fetchFromDatabase(user.id, allUserPlaylistIDs);
            if (userPlaylists) {
                ownedPlaylists = userPlaylists.filter(playlist => playlist.owner_id === user.id).sort((a, b) => b.followers_count - a.followers_count);
            }
            // update user's login status
            await User.updateOne({ id: user.id }, { isLoggedIn: true });
        } else {
            // called when user logs in for the first time or logs in again after logging out (gets fresh data from Spotify)
            const userPlaylists = await fetchFromSpotify(user, headers);
            if (userPlaylists) {
                ownedPlaylists = userPlaylists.filter(playlist => playlist.owner_id === user.id).sort((a, b) => b.followers_count - a.followers_count);
            }
        }
    } catch (e) {
        console.error("Error fetching user playlists:", e);
    }

    const totalPages = Math.ceil(ownedPlaylists.length / playlistPaginationLimit);
    const currentPage = page || 1;
    const playlistsToShow = ownedPlaylists.slice((currentPage - 1) * playlistPaginationLimit, currentPage * playlistPaginationLimit);

    return (
        <div className="min-h-screen bg-black">
            <div className="bg-spotify h-[15vh] xl:h-[20vh] w-full" />

            <div className="max-w-[1400px] mx-auto px-6 relative">
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
                    <DashboardRefreshButton user={user} headers={headers} />
                </div>

                {/* Playlists Section */}
                <div className="mb-20">
                    <div className="flex justify-center items-center gap-3 mb-8">
                        <Music2 className="h-7 w-7 text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Your Public Playlists</h2>
                    </div>

                    <div className="w-full max-md:w-[70vw] mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {playlistsToShow.map((playlist, index) => (
                                <Link
                                    href={`/dashboard/playlist/${playlist.id}?page=1`}
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

                        {/* When empty */}
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

                        <FollowersPagination totalPages={totalPages} />
                    </div>
                </div>
            </div>
        </div>
    );
}