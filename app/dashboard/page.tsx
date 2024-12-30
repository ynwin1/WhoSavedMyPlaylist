import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/component/Buttons/SignOutButton";
import PlaylistCard from "@/app/component/Playlist/PlaylistCard";

type User = {
    id: string;
    name: string;
    image: string;
    playlists: Playlist[];
}

export type Playlist = {
    id: string;
    user_created: boolean;
    name: string;
    image: string;
    followers: number;
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
            console.log(`Playlist name: ${playlist_data.name} & followers: ${playlist_data.followers.total}`);
            return {
                id: playlist_data.id,
                user_created: playlist_data.owner.id === user.id,
                name: playlist_data.name,
                image: playlist_data.images[0]?.url,
                followers: playlist_data.followers.total
            };
        });
        user.playlists = await Promise.all(playlistPromises);
    } catch (e) {
        console.error("Error fetching user playlists:", e);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-12 p-4">
            <img
                src={session.user?.image || ''}
                alt="user image"
                className="rounded-full h-32 w-32 mt-6"
            />
            <h1 className="text-3xl font-bold text-white">
                {`Howdy, ${session.user?.name}!`}
            </h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-20">
                {user.playlists.map((playlist, index) => (
                    playlist.user_created && <PlaylistCard key={index} name={playlist.name} image={playlist.image} followers_count={playlist.followers} />
                ))}
            </div>
        </div>
    );
}