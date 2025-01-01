import mongoose, { Schema, Model, models } from "mongoose";

export interface IPlaylist extends mongoose.Document {
    id: string;
    owner_id: string,
    name: string;
    image: string;
    followers_count: number;
    followers: string[];
}

const PlaylistSchema: Schema<IPlaylist> = new Schema({
    id: { type: String, required: true, unique: true },
    owner_id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    followers_count: { type: Number, required: true },
    followers: { type: [String], required: true },
});

const Playlist: Model<IPlaylist> = models.Playlist || mongoose.model("Playlist", PlaylistSchema);

export default Playlist;