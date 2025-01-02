import React from 'react'
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {getServerSession} from "next-auth/next";
import {redirect} from "next/navigation";
import Playlist from "@/app/model/Playlist";
import Image from "next/image";
import PlaylistFollowersTable from "@/app/component/Playlist/PlaylistFollowersTable";
import Link from "next/link";
import FollowersPagination from "@/app/component/Pagination/FollowersPagination";
import {ExternalLink} from "lucide-react";
import {followersLimit} from "@/app/lib/utils";
import BackToDashboardButton from "@/app/component/Buttons/BackToDashboardButton";

interface PlaylistPageProps {
    params:Promise<{playlist_id: string}>,
    searchParams:Promise<{page?: number, limit?: number}>,
}

export type Follower = {
    id: string;
    name: string;
    image: string;
}

const Page = async ({params, searchParams}: PlaylistPageProps) => {
    const {playlist_id} = await params;
    let {page, limit} = await searchParams;

    page = page || 1;
    limit = limit || followersLimit[0];

    let dbPlaylist = null;
    let spotifyFollowersCount = 0;
    let knownFollowers: Follower[] = [];

    try {
        const session = await getServerSession(authOptions);
        dbPlaylist = await Playlist.findOne({id: playlist_id}).lean();
        if (!session) {
            redirect("/");
        }

        const headers = {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
            headers: headers
        });
        const spotifyPlaylistData = await response.json();
        spotifyFollowersCount = spotifyPlaylistData.followers.total;

        if (dbPlaylist) {
            // splice mutates the original array while slice don't
            const knownFollowerIDs: string[] = dbPlaylist.followers.slice((page - 1) * limit, limit);
            const knownFollowersPromises = knownFollowerIDs.map(async (id: string) => {
                const response = await fetch(`https://api.spotify.com/v1/users/${id}`, {
                    headers: headers
                });
                const followerData = await response.json();
                const follower: Follower = {
                    id: followerData.id,
                    name: followerData.display_name,
                    image: followerData.images[0]?.url
                }
                return follower;
            });
            knownFollowers = await Promise.all(knownFollowersPromises);
        }

    } catch (e) {
        console.error(e);
    }

    // TODO - redirect to dashboard if playlist owner id is not the same as session user id

    if (dbPlaylist) {
        const knownFollowersCount = dbPlaylist.followers.length;
        const totalPages = Math.ceil(knownFollowersCount / limit);
        return (
            <div className="flex flex-col">
                <div>
                    <div className="bg-spotify w-full h-[20vh] max-lg:h-[12vh] max-xl:h-[15vh] z-0"/>
                    <Image
                        src={dbPlaylist.image}
                        alt={dbPlaylist.name}
                        width={200}
                        height={200}
                        className="absolute left-20 max-md:left-10 transform -translate-y-1/2 rounded-full border-4 border-white max-md:w-[8rem] max-md:h-[8rem] max-lg:w-[10rem] max-lg:h-[10rem]"
                    />
                    <div className="flex flex-col gap-6 text-center mt-12 z-10 max-md:mt-24">
                        <h1 className="text-3xl max-sm:text-xl font-bold text-spotify">
                            <div className="flex flex-row max-sm:flex-col items-center justify-center gap-4">
                                <span>{dbPlaylist.name}</span>
                                <Link href={`https://open.spotify.com/playlist/${playlist_id}`} target="_blank">
                                    <ExternalLink className="h-8 w-8 max-sm:h-6 max-sm:w-6 justify-center hover:text-green-800 transition-opacity duration-100 -mt-1"/>
                                </Link>
                            </div>
                        </h1>


                        <h2 className="text-xl text-center font-semibold text-white max-lg:text-base">
                            {knownFollowersCount === 0 ?
                                "We do not know any followers of this playlist yet"
                                :
                                `Out of ${spotifyFollowersCount} followers, 
                                ${knownFollowersCount === 1 ? `${knownFollowersCount} follower is ` : `${knownFollowersCount} followers are ` } 
                                on this platform`
                            }
                        </h2>
                        <BackToDashboardButton />
                    </div>
                    <PlaylistFollowersTable followers={knownFollowers} currentPage={page}/>
                    <FollowersPagination totalPages={totalPages} />
                </div>
            </div>
        )
    }
}
export default Page
