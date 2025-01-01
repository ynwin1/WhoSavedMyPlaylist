import connectDB from "@/app/lib/mongodb";
import {NextRequest, NextResponse} from "next/server";
import User from "@/app/model/User";

export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        await connectDB();

        const userId = params.userId;
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const user = await User.findOneAndUpdate(
            { id: userId },
            { $set: { isLoggedIn: false } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Sign out error:", error);
        return NextResponse.json(
            { error: "Failed to sign out user" },
            { status: 500 }
        );
    }
}
