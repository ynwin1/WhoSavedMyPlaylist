import mongoose, { Schema, Model, models } from "mongoose";

export interface IUser extends mongoose.Document {
    id: string;
    name: string;
    image: string;
    playlists: string[];
}

const UserSchema: Schema<IUser> = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    playlists: { type: [String], required: true },
});

const User: Model<IUser> = models.User || mongoose.model("User", UserSchema);

export default User;