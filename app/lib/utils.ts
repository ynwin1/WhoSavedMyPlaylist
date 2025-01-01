
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