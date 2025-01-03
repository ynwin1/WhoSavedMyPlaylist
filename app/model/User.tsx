import mongoose, { Schema, Model, models } from "mongoose";

export enum PlanType {
    FREE = "free",
    MONTHLY = "monthly",
    LIFETIME = "lifetime"
}

export interface IUser extends mongoose.Document {
    id: string;
    name: string;
    image: string;
    created_playlists: string[];
    followed_playlists: string[];
    isLoggedIn: boolean;
    plan: {
        type: PlanType;
        joined: Date;
        expires: Date;
    }
}

const UserSchema: Schema<IUser> = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    created_playlists: { type: [String], required: true },
    followed_playlists: { type: [String], required: true },
    isLoggedIn: { type: Boolean, required: true, default: true },
    plan: {
        type: {
            type: { type: String, required: true, enum: Object.values(PlanType), default: PlanType.FREE },
            joined: { type: Date, required: true, default: Date.now },
            expires: { type: Date, required: false }
        },
        required: true
    }
});

const User: Model<IUser> = models.User || mongoose.model("User", UserSchema);

export default User;