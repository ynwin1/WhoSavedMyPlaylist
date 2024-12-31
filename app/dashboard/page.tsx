import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import User from "@/app/model/User";
import Playlist from "@/app/model/Playlist";
import PlaylistCard from "@/app/component/Playlist/PlaylistCard";
import connectDB from "@/app/lib/mongodb";

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
        const subscribed_playlists: Playlist[] = user.playlists.filter(playlist => !playlist.user_created);
        const subscribedPlaylistsForDB: PlaylistDB[] = subscribed_playlists.map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            image: playlist.image,
            followers_count: playlist.followers_count,
            followers: []
        }));
        for (const playlist of subscribedPlaylistsForDB) {
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
    } catch (e) {
        console.error("Error fetching user playlists:", e);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-12 p-4 mb-12">
            <img
                src={session.user?.image || ''}
                alt="user image"
                className="rounded-full h-32 w-32 mt-6"
            />
            <h1 className="text-3xl font-bold text-white">
                {`Howdy, ${session.user?.name}!`}
            </h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-20 max-md:gap-10">
                {user.playlists.map((playlist, index) => (
                    playlist.user_created &&
                    <PlaylistCard key={index} name={playlist.name} image={playlist.image} followers_count={playlist.followers_count}/>
                ))}
            </div>
        </div>
    );
}