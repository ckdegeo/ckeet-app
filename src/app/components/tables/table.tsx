'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import '../tabs/tabs.css';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: unknown) => string;
}

interface Action<T> {
  icon: LucideIcon;
  label: string;
  onClick: (item: T) => void;
  color?: string;
  show?: (item: T) => boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  itemsPerPage?: number;
  emptyMessage?: string;
}

export default function Table<T>({
  data,
  columns,
  actions,
  itemsPerPage = 10,
  emptyMessage = "Nenhum item encontrado"
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
          <div className="w-full flex flex-col gap-4">
      {/* Container da tabela com scroll horizontal */}
      <div className="w-full overflow-x-auto rounded-2xl border border-[var(--on-background)] bg-[var(--background)] hide-scrollbar relative isolate">
        <table className="w-full table-fixed" style={{minWidth: '900px'}}>
          {/* Cabeçalho */}
          <thead>
            <tr className="border-b border-[var(--on-background)]">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    px-6 py-4 text-left
                    text-sm font-semibold text-[var(--foreground)]
                    ${column.width ? column.width : ""}
                  `}
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right w-[140px]">
                  <span className="sr-only">Ações</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Corpo */}
          <tbody className="divide-y divide-[var(--on-background)]">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-[var(--foreground)] whitespace-nowrap"
                    >
                      {column.render ? column.render(item[column.key]) : String(item[column.key])}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {actions
                          .filter(action => !action.show || action.show(item))
                          .map((action, actionIndex) => {
                            const Icon = action.icon;
                            const colorClasses: Record<string, string> = {
                              primary: "text-[var(--primary)] hover:bg-[var(--primary)]",
                              error: "text-[var(--error)] hover:bg-[var(--error)]",
                              secondary: "text-[var(--secondary)] hover:bg-[var(--secondary)]"
                            };
                            const color = action.color || "primary";

                            return (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className={`
                                  p-1.5 sm:p-2 rounded-full
                                  ${colorClasses[color]}
                                  hover:bg-opacity-10
                                  transition-colors
                                `}
                                title={action.label}
                              >
                                <Icon size={16} className="sm:w-5 sm:h-5" />
                                <span className="sr-only">{action.label}</span>
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
                  colSpan={actions ? columns.length + 1 : columns.length}
                  className="px-6 py-8 text-center text-sm text-[var(--on-background)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-[var(--foreground)]">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`
                p-2 rounded-full
                text-[var(--foreground)]
                hover:bg-[var(--primary)] hover:bg-opacity-10
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <ChevronLeft size={20} />
              <span className="sr-only">Página anterior</span>
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`
                p-2 rounded-full
                text-[var(--foreground)]
                hover:bg-[var(--primary)] hover:bg-opacity-10
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <ChevronRight size={20} />
              <span className="sr-only">Próxima página</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}