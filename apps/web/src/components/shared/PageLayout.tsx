'use client';

import { Button } from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import { Plus, Search, X } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: ReactNode;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      {action && (
        <Button asChild>
          <a href={action.href}>
            {action.icon || <Plus className="mr-2 h-4 w-4" />}
            {action.label}
          </a>
        </Button>
      )}
    </div>
  );
}

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  filters?: {
    key: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }[];
  extraActions?: ReactNode;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}

export function SearchFilterBar({
  searchPlaceholder = '搜索...',
  searchValue = '',
  onSearchChange,
  onSearch,
  filters,
  extraActions,
  showClearFilters,
  onClearFilters,
}: SearchFilterBarProps) {
  return (
    <div className="flex items-center gap-4">
      {/* 搜索框 */}
      <div className="flex-1 flex gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch?.()}
          className="max-w-md"
        />
        {onSearch && (
          <Button onClick={onSearch} variant="default">
            <Search className="mr-2 h-4 w-4" />
            搜索
          </Button>
        )}
      </div>

      {/* 筛选器 */}
      {filters?.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* 额外操作 */}
      {extraActions}

      {/* 清除筛选按钮 */}
      {showClearFilters && (
        <Button variant="secondary" onClick={onClearFilters}>
          <X className="mr-2 h-4 w-4" />
          清除筛选
        </Button>
      )}
    </div>
  );
}

interface DataTableProps {
  columns: {
    key: string;
    title: string;
    className?: string;
  }[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  renderRow: (row: any, index: number) => ReactNode;
}

export function DataTable({
  columns,
  data,
  loading = false,
  emptyMessage = '暂无数据',
  onRowClick,
  renderRow,
}: DataTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${
                  column.className || ''
                }`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                加载中...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                className={`border-b transition-colors hover:bg-muted/50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {renderRow(row, index)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
