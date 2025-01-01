import React from 'react';
import {Follower} from "@/app/dashboard/playlist/[playlist_id]/page";
import Link from "next/link";
import { ExternalLink, Users } from 'lucide-react';
import {paginationLimit} from "@/app/lib/utils";

const PlaylistFollowersTable = ({ followers, currentPage }: { followers: Follower[], currentPage: number }) => {
    const followersToShow = followers.slice((currentPage - 1) * paginationLimit, currentPage * paginationLimit);

    return (
        <div className="flex flex-col items-center justify-center px-4 mt-20">
            <div className="flex items-center gap-3 mb-6">
                <Users className="h-8 w-8 text-green-500" />
                <h1 className="text-3xl font-bold text-white max-md:text-2xl">
                    Followers
                </h1>
            </div>

            <div className="w-[60vw] max-md:w-[90vw] rounded-xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-white/10 bg-black/40">
                            <th className="px-6 py-4 text-left text-sm font-medium text-white">PROFILE</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-white">NAME</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-white">PROFILE LINK</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                        {followersToShow.map((follower, index) => (
                            <tr
                                key={index}
                                className="group hover:bg-white/5 transition-colors duration-200"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            src={follower.image}
                                            alt={follower.name}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-green-500 transition-all duration-200"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white group-hover:text-green-500 transition-colors duration-200">
                                        {follower.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link
                                        href={`https://open.spotify.com/user/${follower.id}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 text-white hover:text-green-500 transition-colors duration-200"
                                    >
                                        <span className="text-sm">View Profile</span>
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default PlaylistFollowersTable
