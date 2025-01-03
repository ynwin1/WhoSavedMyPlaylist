"use server"
import User from "@/app/model/User";
import {Playlist as PlaylistT, PlaylistDB, User as UserT, UserDB} from "@/app/lib/data_types"
import Playlist from "@/app/model/Playlist";
import connectDB from "@/app/lib/mongodb";
import NodeCache from "node-cache";

const PlaylistCache = new NodeCache({
    stdTTL: 300, // expire after 5 minutes
    checkperiod: 60 // check every minute
})

export async function fetchFromDatabase(user_id: string, allPlaylists: string[]) {
    const cacheKey = `user:${user_id}_${allPlaylists.join("_")}`;
    const cachedPlaylists: PlaylistT[] | undefined = PlaylistCache.get<PlaylistT[]>(cacheKey);

    if (cachedPlaylists) {
        console.log("Returning from cache");
        return cachedPlaylists;
    }

    console.log("Fetching from database");
    const playlistsFromDB = await Playlist.find({ id: { $in: allPlaylists } }).lean();
    if (!playlistsFromDB.length) {
        return undefined;
    }

    let playlists: PlaylistT[] = playlistsFromDB.map(playlist => ({
        id: playlist.id,
        owner_id: playlist.owner_id,
        name: playlist.name,
        image: playlist.image,
        followers_count: playlist.followers_count
    }));

    PlaylistCache.set(cacheKey, playlists.sort((a, b) => b.followers_count - a.followers_count));
    return playlists;
}

export async function fetchFromSpotify(user: UserT, headers: any) {
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
            const playlist: PlaylistT = {
                id: playlist_data.id,
                owner_id: playlist_data.owner.id,
                name: playlist_data.name,
                image: playlist_data.images[0]?.url,
                followers_count: playlist_data.followers.total
            }
            return playlist;
        });
        const allPlaylists = await Promise.all(playlistPromises);
        user.created_playlists = allPlaylists.filter(playlist => playlist.owner_id === user.id).sort((a, b) => b.followers_count - a.followers_count);
        user.followed_playlists = allPlaylists.filter(playlist => playlist.owner_id !== user.id);

        await connectDB();
        // create or update user in the database
        let userForDB: UserDB = {
            id: user.id,
            name: user.name,
            image: user.image,
            created_playlists: user.created_playlists.map(playlist => playlist.id),
            followed_playlists: user.followed_playlists.map(playlist => playlist.id),
            isLoggedIn: true
        }

        /*
        * If existing user, extract created and followed playlists from the database
        * extract deleted and unfollowed playlists from the result (if any)
        * for deleted playlists, remove them from the database, for unfollowed playlists, remove user from followers list
        */
        const existingUser = await User.findOne({ id: user.id });
        if (existingUser) {
            const createdPlaylistsFromDB: string[] = existingUser.created_playlists;
            const followedPlaylistsFromDB: string[] = existingUser.followed_playlists;

            // deleted playlists are those that are in db but not in user.created_playlists
            const deletedPlaylists: string[] = createdPlaylistsFromDB.filter(playlist => !user.created_playlists.map(playlist => playlist.id).includes(playlist));
            // unfollowed playlists are those that are in db but not in user.followed_playlists
            const unfollowedPlaylists: string[] = followedPlaylistsFromDB.filter(playlist => !user.followed_playlists.map(playlist => playlist.id).includes(playlist));

            // remove deleted playlists from the database
            await Playlist.deleteMany({ id: { $in: deletedPlaylists } });
            // remove user from unfollowed playlists' followers list
            await Playlist.updateMany({ id: { $in: unfollowedPlaylists } }, { $pull: { followers: user.id } });
        }
        await User.updateOne({ id: user.id }, userForDB, { upsert: true });

        // create or update playlists in the database
        const combinedPlaylists = user.created_playlists.concat(user.followed_playlists);
        const playlistsForDB: PlaylistDB[] = combinedPlaylists.map(playlist => ({
            id: playlist.id,
            owner_id: playlist.owner_id,
            name: playlist.name,
            image: playlist.image,
            followers_count: playlist.followers_count,
            followers: []
        }));
        const bulkOps = playlistsForDB.map(playlist => ({
            updateOne: {
                filter: { id: playlist.id },
                update: {
                    $set: {
                        id: playlist.id,
                        owner_id: playlist.owner_id,
                        name: playlist.name,
                        image: playlist.image,
                        followers_count: playlist.followers_count,
                    },
                    ...(playlist.owner_id !== user.id && { $addToSet: { followers: user.id } })
                },
                upsert: true
            }
        }));
        await Playlist.bulkWrite(bulkOps);
        PlaylistCache.flushAll(); // clear cache
        return user.created_playlists;
    } catch (e) {
        console.error("Error fetching user playlists:", e);
    }
}

export async function refreshDashboard(user: UserT, headers: any) {
    await fetchFromSpotify(user, headers);
}