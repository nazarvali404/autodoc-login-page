'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, getStatusColor } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends any> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: string[];
  onRowClick?: (item: T) => void;
  statusKey?: string;
  statusOptions?: string[];
  pageSize?: number;
}

export default function DataTable<T extends any>({
  data,
  columns,
  searchKeys = [],
  onRowClick,
  statusKey,
  statusOptions = [],
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        searchKeys.some(key => {
          const val = (item as any)[key];
          return typeof val === 'string' && val.toLowerCase().includes(q);
        })
      );
    }

    // Status filter
    if (statusFilter !== 'all' && statusKey) {
      result = result.filter(item => (item as any)[statusKey] === statusFilter);
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = String((a as any)[sortKey] ?? '');
        const bVal = String((b as any)[sortKey] ?? '');
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, searchKeys, statusFilter, statusKey, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search..."
            className="pl-10 h-10 bg-secondary/50 border-0 rounded-xl"
          />
        </div>
        {statusKey && statusOptions.length > 0 && (
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v || 'all'); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl bg-secondary/50 border-0">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              {columns.map(col => (
                <TableHead
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, idx) => (
                <motion.tr
                  key={String((item as any).id ?? idx)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'border-b border-border/50 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-accent/50'
                  )}
                >
                  {columns.map(col => (
                    <TableCell key={col.key} className="py-3 text-sm">
                      {col.render ? col.render(item) : (
                        col.key === statusKey ? (
                          <Badge variant="secondary" className={cn('font-medium', getStatusColor(String((item as any)[col.key] ?? '')))}>
                            {String((item as any)[col.key] ?? '')}
                          </Badge>
                        ) : (
                          String((item as any)[col.key] ?? '—')
                        )
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              currentPage + 2
            ).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setCurrentPage(page)}
                className="h-8 w-8 rounded-lg text-xs"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}