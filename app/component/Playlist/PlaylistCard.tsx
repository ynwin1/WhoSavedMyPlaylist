import React from 'react';
import Image from 'next/image';

interface PlaylistCardProps {
    name: string;
    image: string;
    followers_count: number;
}

const PlaylistCard = ({ name, image, followers_count }: PlaylistCardProps) => {
    // console.log("Followers count: ", followers_count);
    return (
        <div className="group relative overflow-hidden border-2 border-spotify rounded-xl bg-zinc-900/40 p-4 transition-all duration-300 hover:bg-zinc-900/60 backdrop-blur-sm hover:cursor-pointer ">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                    src={image}
                    alt={`${name} playlist cover`}
                    width={200}
                    height={200}
                    className="object-cover transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            <div className="mt-4 space-y-2">
                <h2 className="line-clamp-2 text-lg font-semibold text-white group-hover:text-green-400">
                    {name}
                </h2>

                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <span>
                        {followers_count} followers
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PlaylistCard;