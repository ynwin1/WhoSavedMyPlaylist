import NavBar from "@/app/component/NavBar/NavBar";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | WhoSavedMyPlaylist",
        default: "WhoSavedMyPlaylist",
    },
}

export default function DashboardLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <NavBar />
            <div className="mt-16 mb-10">
                {children}
            </div>
        </div>
    );
}
