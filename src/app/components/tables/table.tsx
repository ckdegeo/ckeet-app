'use client';

import { useState } from 'react';
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
  primaryColor?: string;
  secondaryColor?: string;
}

export default function Table<T>({
  data,
  columns,
  actions,
  itemsPerPage = 10,
  emptyMessage = "Nenhum item encontrado",
  primaryColor = '#bd253c',
  secondaryColor = '#970b27'
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
      <div 
        className="w-full overflow-x-auto rounded-2xl border hide-scrollbar relative isolate"
        style={{
          borderColor: `${primaryColor}20`,
          backgroundColor: 'white'
        }}
      >
        <table className="w-full table-fixed" style={{minWidth: '900px'}}>
          {/* Cabeçalho */}
          <thead>
            <tr 
              className="border-b"
              style={{ borderColor: `${primaryColor}20` }}
            >
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    px-6 py-4 text-left text-sm font-semibold
                    ${column.width ? column.width : ""}
                  `}
                  style={{ 
                    color: primaryColor,
                    backgroundColor: `${primaryColor}05`
                  }}
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th 
                  className="px-6 py-4 text-right w-[140px]"
                  style={{ 
                    color: primaryColor,
                    backgroundColor: `${primaryColor}05`
                  }}
                >
                  <span className="sr-only">Ações</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Corpo */}
          <tbody 
            className="divide-y"
            style={{ borderColor: `${primaryColor}10` }}
          >
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition-colors"
                  style={{
                    backgroundColor: rowIndex % 2 === 0 ? 'white' : `${primaryColor}02`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${primaryColor}05`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? 'white' : `${primaryColor}02`;
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: '#374151' }}
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
                            const color = action.color || "primary";

                            return (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-opacity-10 transition-colors"
                                style={{
                                  color: color === 'primary' ? primaryColor : 
                                         color === 'secondary' ? secondaryColor : 
                                         color === 'error' ? '#dc2626' : primaryColor
                                }}
                                onMouseEnter={(e) => {
                                  const bgColor = color === 'primary' ? primaryColor : 
                                                color === 'secondary' ? secondaryColor : 
                                                color === 'error' ? '#dc2626' : primaryColor;
                                  e.currentTarget.style.backgroundColor = `${bgColor}10`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
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
                  className="px-6 py-8 text-center text-sm"
                  style={{ color: '#6b7280' }}
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
          <div 
            className="text-sm"
            style={{ color: '#374151' }}
          >
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                color: '#374151',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                  e.currentTarget.style.color = primaryColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#374151';
                }
              }}
            >
              <ChevronLeft size={20} />
              <span className="sr-only">Página anterior</span>
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                color: '#374151',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                  e.currentTarget.style.color = primaryColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#374151';
                }
              }}
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