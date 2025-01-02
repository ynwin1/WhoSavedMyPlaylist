export type User = {
    id: string;
    name: string;
    image: string;
    created_playlists: Playlist[];
    followed_playlists: Playlist[];
}

export type UserDB = {
    id: string;
    name: string;
    image: string;
    created_playlists: string[];
    followed_playlists: string[];
    isLoggedIn: true;
}

export type Playlist = {
    id: string;
    owner_id: string;
    name: string;
    image: string;
    followers_count: number;
}

export type PlaylistDB = {
    id: string;
    owner_id: string;
    name: string;
    image: string;
    followers_count: number;
    followers: string[];
}

export type Follower = {
    id: string;
    name: string;
    image: string;
}