'use client';

import { useMemo, useState } from 'react';

export function usePagination(total: number, initialPage = 1, pageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pagination = useMemo(
    () => ({
      page,
      pageSize,
      totalPages,
      offset: (page - 1) * pageSize,
    }),
    [page, pageSize, totalPages],
  );

  return { ...pagination, setPage };
}
