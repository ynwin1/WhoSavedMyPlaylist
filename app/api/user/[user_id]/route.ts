import {NextRequest} from "next/server";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/model/User";
import Playlist from "@/app/model/Playlist";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

type Props = {
    params: Promise<{user_id: string}>
}


export async function DELETE(
    request: NextRequest,
    props: Props
) {
    try {
        const { user_id } = await props.params;
        const session = await getServerSession(authOptions);

        // check if user is logged in
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // check if user is deleting their own account
        if (session.user.id !== user_id) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        await connectDB();
        // find user
        const user = await User.findOne({ id: user_id });
        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // find playlists
        const playlists = user.playlists;
        for (let i = 0; i < playlists.length; i++) {
            const playlist = await Playlist.findOne({ id: playlists[i] });
            if (playlist) {
                // delete if playlist is owned by the user
                if (playlist.owner_id === user.id) {
                    await Playlist.deleteOne({ id: playlist.id });
                } else {
                    // remove user from followers of the playlist
                    await Playlist.findOneAndUpdate({ id: playlist.id }, {
                        $pull: {
                            followers: user.id
                        }
                    })
                }
            }
        }

        // delete user
        await User.deleteOne({ id: user.id });
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 500 });
    }
}