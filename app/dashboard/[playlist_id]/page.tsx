import React from 'react'
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {getServerSession} from "next-auth/next";
import {redirect} from "next/navigation";
import Playlist from "@/app/model/Playlist";
import Image from "next/image";

interface PlaylistPageProps {
    params:Promise<{playlist_id: string}>;
}

const Page = async ({params}: PlaylistPageProps) => {
    const {playlist_id} = await params;
    console.log(playlist_id);

    let playList = null;

    let session = null;
    try {
        session = await getServerSession(authOptions);
        playList = await Playlist.findOne({id: playlist_id});
    } catch (e) {
        console.error(e);
    }

    if (!session) {
        redirect("/");
    }

    // TODO - redirect to dashboard if playlist owner id is not the same as session user id


    if (playList) {
        return (
            <div className="flex flex-col">
                <div className="bg-spotify w-full h-[10vh]"/>
                <Image src={playList.image} alt={playList.name} width={200} height={200}
                       className="-mt-6 rounded-full border-4 border-white ml-6"
                />
                <h1 className="text-3xl font-bold text-white">{playList.name}</h1>
                <h2 className="text-xl font-semibold text-white">{playList.followers_count} followers</h2>
            </div>
        )
    }

    return (
        <div>
            Followers of this playlist are not on this platform yet.
        </div>
    )
}
export default Page
