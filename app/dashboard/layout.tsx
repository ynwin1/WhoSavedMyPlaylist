import NavBar from "@/app/component/NavBar/NavBar";

export default function DashboardLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <NavBar />
            <div className="mt-16">
                {children}
            </div>
        </div>
    );
}
