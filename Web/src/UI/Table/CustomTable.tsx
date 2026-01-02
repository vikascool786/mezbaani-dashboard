import React, { useState, useMemo, useEffect } from 'react';

type HeaderType =
  | string
  | {
    key: string;
    label: string;
  };

interface CustomTableProps {
  headers: HeaderType[];
  data: Record<string, any>[];
  isSortable?: boolean;
  onHandleClick?: (row: Record<string, any>) => void;
  buttonLabel?: string;
  fetchData?: (page: number, pageSize: number, search?: string, sortConfig?: SortConfig) => Promise<{ data: Record<string, any>[]; total: number }>;
  pageSize?: number;
}

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

const getHeaderKey = (header: HeaderType): string =>
  typeof header === 'string' ? header : header.key;

const getHeaderLabel = (header: HeaderType): string =>
  typeof header === 'string' ? header : header.label;

const CustomTable: React.FC<CustomTableProps> = ({ headers, data: initialData, isSortable = false, onHandleClick, buttonLabel = "Action", fetchData, pageSize = 10 }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [data, setData] = useState<Record<string, any>[]>(initialData);
  const [loading, setLoading] = useState(false);

  const handleSort = (key: string) => {
    if (!isSortable) return;
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortConfig]);

  useEffect(() => {
    if (fetchData) {
      setLoading(true);
      fetchData(currentPage, pageSize, search, sortConfig)
        .then(({ data: fetchedData, total }) => {
          setData(fetchedData);
          setTotalRecords(total);
          setLoading(false);
        })
        .catch(() => {
          setData([]);
          setTotalRecords(0);
          setLoading(false);
        });
    } else {
      setData(initialData);
      setTotalRecords(initialData.length);
    }
  }, [fetchData, currentPage, pageSize, search, sortConfig, initialData]);

  const filteredData = useMemo(() => {
    if (fetchData) return data;
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter((row) =>
      headers.some((header) => {
        const key = getHeaderKey(header);
        const value = row[key];
        if (value === undefined || value === null) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [search, data, headers, fetchData]);

  const sortedData = useMemo(() => {
    if (fetchData) return filteredData;
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue === undefined || bValue === undefined) return 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, fetchData]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="align-content-center d-flex justify-content-end me-auto">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              {headers.map((header) => {
                const key = getHeaderKey(header);
                const label = getHeaderLabel(header);
                let sortIcon = null;
                if (isSortable) {
                  if (sortConfig && sortConfig.key === key) {
                    sortIcon = (
                      <span>
                        {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                      </span>
                    );
                  } else {
                    sortIcon = <span className="text-muted"> ⇅</span>;
                  }
                }
                return (
                  <th
                    key={key}
                    style={isSortable ? { cursor: 'pointer', userSelect: 'none' } : undefined}
                    onClick={() => isSortable && handleSort(key)}
                    scope="col"
                  >
                    {label}
                    {isSortable && sortIcon}
                  </th>
                );
              })}
              {onHandleClick && <th scope="col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length + (onHandleClick ? 1 : 0)} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={headers.length + (onHandleClick ? 1 : 0)} className="text-center">
                  No data found.
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr key={idx}>
                  {headers.map((header) => {
                    const key = getHeaderKey(header);
                    return <td key={key}>{row[key]}</td>;
                  })}
                  {onHandleClick && (
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onHandleClick(row)}
                      >
                        {buttonLabel}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-end">
            <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item${page === currentPage ? ' active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page)}>
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default CustomTable;