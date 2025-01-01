import mongoose, { Schema, Model, models } from "mongoose";

export interface IUser extends mongoose.Document {
    id: string;
    name: string;
    image: string;
    created_playlists: string[];
    followed_playlists: string[];
    isLoggedIn: boolean;
}

const UserSchema: Schema<IUser> = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    created_playlists: { type: [String], required: true },
    followed_playlists: { type: [String], required: true },
    isLoggedIn: { type: Boolean, required: true, default: true },
});

const User: Model<IUser> = models.User || mongoose.model("User", UserSchema);

export default User;