export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function calculatePagination(
  page: number,
  pageSize: number,
  total: number
): PaginationInfo {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);
  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

export function skipFromPage(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

export function pageFromSkip(skip: number, pageSize: number): number {
  return Math.floor(skip / pageSize) + 1;
}

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): (number | '...')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  const halfVisible = Math.floor(maxVisible / 2);
  const startPage = Math.max(1, currentPage - halfVisible);
  const endPage = Math.min(totalPages, currentPage + halfVisible);

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return pages;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];
