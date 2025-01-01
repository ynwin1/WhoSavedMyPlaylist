export const paginationLimit = 10;
export const playlistPaginationLimit = 4;

export const playlistsLimitXl = [4, 8, 12, 16, 20];
export const playListsLimitLg = [3, 6, 9, 12, 15];
export const playlistsLimitMd = [2, 4, 6, 8, 10];
export const playlistsLimitDefault = [5, 10, 15, 20];

export const followersLimit = [10, 20, 50, 100, 200];

export const generateFollowersPagination = (currentPage: number, totalPages: number) => {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
        if (currentPage === 3) {
            return [1, 2, 3, 4, '...', totalPages];
        } else {
            return [1, 2, 3, '...', totalPages];
        }
    }

    if (currentPage >= totalPages - 2) {
        if (currentPage === totalPages - 2) {
            return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            return [1, '...', totalPages - 2, totalPages - 1, totalPages];
        }
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}