import connectDB from "@/app/lib/mongodb";
import {NextRequest, NextResponse} from "next/server";
import User from "@/app/model/User";

type Props = {
    params: Promise<{ user_id: string }>;
}

export async function PUT(
    request: NextRequest,
    props: Props
) {
    try {
        await connectDB();
        const {user_id} = await props.params;
        if (!user_id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const user = await User.findOneAndUpdate(
            { id: user_id },
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
