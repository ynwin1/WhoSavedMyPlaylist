import { getServerSession } from "next-auth/next";
import {authOptions, CustomSession} from "@/app/lib/auth";
import { redirect } from "next/navigation";
import User from "@/app/model/User";
import PlaylistCard from "@/app/component/Playlist/PlaylistCard";
import connectDB from "@/app/lib/mongodb";
import Link from "next/link";
import {Music2, PlayCircle} from "lucide-react";
import {Metadata} from "next";
import DashboardRefreshButton from "@/app/component/Buttons/DashboardRefreshButton";
import {followersLimit, LimitType} from "@/app/lib/utils";
import FollowersPagination from "@/app/component/Pagination/FollowersPagination";
import ItemsPerPageSelector from "@/app/component/Pagination/ItemsPerPageSelector";
import DeleteUserButton from "@/app/component/Buttons/DeleteUserButton";
import {User as UserT, Playlist as PlaylistT} from "@/app/lib/data_types";
import {fetchFromDatabase, fetchFromSpotify} from "@/app/lib/actions";

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Your personal dashboard to see followers on your Spotify playlists.'
}

type DashboardPageProps = {
    searchParams: Promise<{page?: number, limit?: number}>;
}

export default async function Page({ searchParams }: DashboardPageProps) {
    const session: CustomSession | null = await getServerSession(authOptions);
    const { page } = await searchParams;
    const { limit } = await searchParams;

    if (!session) {
        redirect("/");
    }

    const user: UserT = {
        id: session.user?.id as string,
        name: session.user?.name as string,
        image: session.user?.image as string,
        created_playlists: [],
        followed_playlists: []
    };

    const headers = {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
    }

    let createdPlaylistsSize: number = 0;

    const limitPerPage: number = limit || 4;
    const currentPage: number = page || 1;
    let totalPages: number = 0;
    let playlistsToShow: PlaylistT[] = [];

    try {
        await connectDB();
        const userFromDB = await User.findOne({ id: user.id }).lean();
        if (userFromDB && userFromDB.isLoggedIn) {
            // called whenever user navigates to dashboard after logging in (no need to fetch from Spotify)
            createdPlaylistsSize = userFromDB.created_playlists.length;
            totalPages = Math.ceil(createdPlaylistsSize / limitPerPage);
            const playlistsToQuery = userFromDB.created_playlists.slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage);
            const userPlaylists = await fetchFromDatabase(user.id, playlistsToQuery);
            if (userPlaylists) {
                playlistsToShow = userPlaylists;
            }
            // update user's login status
            await User.updateOne({ id: user.id }, { isLoggedIn: true });
        } else {
            // called when user logs in for the first time or logs in again after logging out (gets fresh data from Spotify)
            const userPlaylists = await fetchFromSpotify(user, headers);
            createdPlaylistsSize = userPlaylists ? userPlaylists.length : 0;
            if (userPlaylists) {
                totalPages = Math.ceil(userPlaylists.length / limitPerPage);
                playlistsToShow = userPlaylists
                    .slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage);
            }
        }
    } catch (e) {
        console.error("Error fetching user playlists:", e);
    }

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
                            {`${createdPlaylistsSize} Created Playlists`}
                        </p>
                    </div>
                    <DashboardRefreshButton user={user} headers={headers} />
                </div>
                {/* Playlists Section */}
                <div className="mb-20">
                    <div className="flex justify-center items-center gap-3 mb-8">
                        <Music2 className="h-7 w-7 text-green-500" />
                        <h2 className="text-2xl font-bold text-white text-center">Your Public Playlists</h2>
                    </div>
                    <ItemsPerPageSelector limitType={LimitType.Playlist}/>
                    <div className="w-full max-md:w-[70vw] mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {playlistsToShow.map((playlist, index) => (
                                <Link
                                    href={`/dashboard/playlist/${playlist.id}?page=1&limit=${followersLimit[0]}`}
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
                        {createdPlaylistsSize === 0 && (
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
                        <DeleteUserButton user_id={user.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}