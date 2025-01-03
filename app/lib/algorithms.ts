import {Playlist} from "@/app/lib/data_types";

export function selectPlaylistToDisplay(playlists: Playlist[]): Playlist {
    return {
        id: '1',
        owner_id: '1',
        name: 'My Playlist',
        image: 'https://example.com/playlist.jpg',
        followers_count: 100,
        known_followers_count: 50
    }
}