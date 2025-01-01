"use client";
import React, {useEffect, useState} from 'react'
import {usePathname, useSearchParams} from "next/navigation";
import {playlistsLimitDefault, playListsLimitLg, playlistsLimitMd, playlistsLimitXl} from "@/app/lib/utils";
import Link from "next/link";
import {ChevronDown} from "lucide-react";

const SCREEN_XL = 1280;
const SCREEN_LG = 1024;
const SCREEN_SM = 640;

export function useScreenSizeLimits() {
    const [limitList, setLimitList] = useState(playlistsLimitDefault);

    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth;

            if (width >= SCREEN_XL) {
                setLimitList(playlistsLimitXl);
            } else if (width >= SCREEN_LG) {
                setLimitList(playListsLimitLg);
            } else if (width >= SCREEN_SM) {
                setLimitList(playlistsLimitMd);
            } else {
                setLimitList(playlistsLimitDefault);
            }
        }

        // Set initial value
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return limitList;
}

const ItemsPerPageSelector = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // get items per page list based on window size
    let limitList: number[] = useScreenSizeLimits();
    const currentLimit = Number(searchParams.get('limit')) || limitList[0];

    const createItemsPerPageURL = (itemsPerPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('limit', itemsPerPage.toString());
        return `${pathname}?${params.toString()}`;
    }

    return (
        <div className="flex flex-col items-center mt-6 mb-6">
            <div className="relative">
                <div className="peer flex items-center gap-2 text-white bg-spotify hover:bg-green-800 rounded-full px-4 py-2 cursor-pointer">
                    <span className="text-sm font-medium">Show {currentLimit} items</span>
                    <ChevronDown className="w-4 h-4" />
                </div>

                <div className="absolute z-10 mt-2 w-40 bg-gray-900 rounded-lg shadow-xl
                       opacity-0 invisible peer-hover:opacity-100 peer-hover:visible
                       hover:opacity-100 hover:visible
                       transition-all duration-200">
                    <div className="py-1">
                        {limitList.map((limit) => (
                            <Link
                                key={limit}
                                href={createItemsPerPageURL(limit)}
                                className={`block px-4 py-2 text-sm ${
                                    currentLimit === limit
                                        ? 'bg-green-500 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'
                                }`}
                            >
                                {limit}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ItemsPerPageSelector
