"use client";
import React from 'react'
import {generateFollowersPagination} from "@/app/lib/utils";
import {usePathname, useSearchParams} from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

const FollowersPagination = ({totalPages} : {totalPages: number}) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;
    const pagination:(string|number)[] = generateFollowersPagination(currentPage, totalPages);

    function createPageURL(page: string | number) {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        return `${pathname}?${params.toString()}`;
    }

    return (
        <div className="flex flex-row gap-2 items-center justify-center mt-10">
            {pagination.map((page, index) => {
                let position: "first" | "last" | "single" | "middle" | undefined;

                if (index === 0) position = 'first';
                if (index === pagination.length - 1) position = 'last';
                if (pagination.length === 1) position = 'single';
                if (typeof page === 'string' && page === '...') position = 'middle';

                return (
                    <PaginationNumber
                        key={`${index}-${page}`}
                        href={createPageURL(page)}
                        page={page}
                        position={position}
                        isCurrentPage={currentPage === page}
                    />
                );
            })}
        </div>
    )
}

type PaginationNumberProps = {
    href: string;
    page: string | number;
    position: "first" | "last" | "single" | "middle" | undefined;
    isCurrentPage: boolean;
}

function PaginationNumber({href, page, position, isCurrentPage} : PaginationNumberProps) {
    const className = clsx(
        'flex h-10 w-10 items-center justify-center rounded-full border border-white',
        {
            'z-10 bg-spotify border-2 border-white text-white': isCurrentPage,
            'hover:bg-green-700': !isCurrentPage && position !== 'middle',
            'text-white': position === 'middle',
        }
    );

    if (isCurrentPage || position === 'middle') {
        return (
            <div className={className}>
                {page}
            </div>
        )
    }

    return (
        <Link href={href}>
            {page}
        </Link>
    )
}
export default FollowersPagination
