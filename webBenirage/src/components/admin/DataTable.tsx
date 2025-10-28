import React, { useState, useMemo } from 'react';
import {
  ChevronsUpDown, Search,
  Download, Filter,
  ArrowUp, ArrowDown
} from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  sortable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
  };
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  actions?: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: (item: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  bulkActions?: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: (selectedItems: T[]) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  onSearch,
  sortable = true,
  pagination = { enabled: true, pageSize: 10, pageSizeOptions: [10, 25, 50] },
  selectable = false,
  onSelectionChange,
  actions = [],
  bulkActions = [],
  loading = false,
  emptyMessage = "No data available",
  className = ""
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = column.key.toString().split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], item as unknown);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (value as any)?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig && sortable) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = sortConfig.key.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], a as unknown);
        const bValue = sortConfig.key.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], b as unknown);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((aValue as any) < (bValue as any)) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((aValue as any) > (bValue as any)) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, sortConfig, sortable, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination.enabled) return processedData;

    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize, pagination.enabled]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    setSortConfig(current => {
      if (current?.key === columnKey) {
        if (current.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        }
        return null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(processedData.map(item => getItemId(item)));
      setSelectedItems(allIds);
      onSelectionChange?.(processedData);
    } else {
      setSelectedItems(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    const itemId = getItemId(item);

    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }

    setSelectedItems(newSelected);

    const selectedItemsArray = processedData.filter(item =>
      newSelected.has(getItemId(item))
    );
    onSelectionChange?.(selectedItemsArray);
  };

  const getItemId = (item: T): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (item as any).id?.toString() || (item as any).key?.toString() || Math.random().toString();
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortable || sortConfig?.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ?
      <ArrowUp className="w-4 h-4 text-blue-600" /> :
      <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const getColumnValue = (item: T, columnKey: string) => {
    return columnKey.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], item as unknown);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
      {/* Header with search and bulk actions */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] touch-manipulation text-base w-full sm:w-auto"
                />
              </div>
            )}

            {selectedItems.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} selected
                </span>
                {bulkActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        const selectedItemsArray = processedData.filter(item =>
                          selectedItems.has(getItemId(item))
                        );
                        action.onClick(selectedItemsArray);
                      }}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium ${
                        action.variant === 'danger'
                          ? 'text-red-600 hover:bg-red-50'
                          : action.variant === 'primary'
                          ? 'text-blue-600 hover:bg-blue-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500">
          Showing {paginatedData.length} of {processedData.length} results
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === processedData.length && processedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width ? `w-${column.width}` : ''
                  } ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                >
                  {sortable && column.sortable !== false ? (
                    <button
                      onClick={() => handleSort(column.key.toString())}
                      className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none"
                    >
                      <span>{column.header}</span>
                      {getSortIcon(column.key.toString())}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={getItemId(item) || index} className="hover:bg-gray-50">
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(getItemId(item))}
                        onChange={(e) => handleSelectItem(item, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = getColumnValue(item, column.key.toString());
                    return (
                      <td
                        key={column.key.toString()}
                        className={`px-3 sm:px-6 py-4 text-sm ${
                          column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                        }`}
                      >
                        {column.render ? (
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          column.render(value as any, item)
                        ) : (
                          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(value as any)?.toString() || '-'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {actions.map((action, actionIndex) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={`p-1 rounded-md ${
                                action.variant === 'danger'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : action.variant === 'primary'
                                  ? 'text-blue-600 hover:bg-blue-50'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              title={action.label}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-12 text-center"
                >
                  <div className="text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="font-medium">{emptyMessage}</p>
                    {searchQuery && (
                      <p className="text-sm mt-1">Try adjusting your search terms</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.enabled && totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] touch-manipulation"
              >
                {pagination.pageSizeOptions?.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-sm text-gray-700 text-center sm:text-left">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-h-[44px] touch-manipulation"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-h-[44px] touch-manipulation"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;