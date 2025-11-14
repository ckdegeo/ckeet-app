'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import '../tabs/tabs.css';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: unknown, item: T) => string | React.ReactElement;
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
  titleColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  actionsFirst?: boolean; // Se true, actions aparecem antes das colunas
}

export default function Table<T>({
  data,
  columns,
  actions,
  itemsPerPage = 10,
  emptyMessage = "Nenhum item encontrado",
  primaryColor = '#bd253c',
  secondaryColor = '#970b27',
  titleColor,
  backgroundColor,
  borderColor,
  rounded = '2xl',
  actionsFirst = false
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const pathname = usePathname();
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // Detectar se está no ambiente seller para usar design system padrão
  const isSellerEnv = pathname?.startsWith('/seller');
  const useDefaultStyles = isSellerEnv;
  
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

  // Função auxiliar para obter classes de arredondamento
  const getRoundedClass = (roundedValue?: string) => {
    if (!roundedValue || useDefaultStyles) return 'rounded-2xl';
    const roundedMap: Record<string, string> = {
      'none': 'rounded-none',
      'sm': 'rounded-sm',
      'md': 'rounded-md',
      'lg': 'rounded-lg',
      'xl': 'rounded-xl',
      '2xl': 'rounded-2xl',
      'full': 'rounded-full',
    };
    return roundedMap[roundedValue] || 'rounded-2xl';
  };

  return (
    <div className="w-full flex flex-col gap-4 min-w-0">
      {/* Container da tabela com scroll horizontal */}
      <div 
        className={`w-full max-w-full overflow-x-auto overflow-y-visible border relative isolate ${
          getRoundedClass(rounded)
        } ${
          useDefaultStyles ? 'bg-[var(--surface)]' : ''
        }`}
        style={{
          ...(useDefaultStyles ? {
            borderColor: 'var(--border)'
          } : {
            borderColor: borderColor || `${primaryColor}20`,
            backgroundColor: backgroundColor || 'white'
          }),
          maxWidth: '100%'
        }}
      >
        <table style={{minWidth: '2200px', tableLayout: 'fixed'}}>
          {/* Cabeçalho */}
          <thead>
            <tr 
              className={useDefaultStyles ? '' : 'border-b'}
              style={useDefaultStyles ? {} : {
                borderColor: borderColor ? `${borderColor}40` : `${primaryColor}20`
              }}
            >
              {actionsFirst && actions && (
                <th 
                  className={`px-4 py-4 text-right w-[140px] ${
                    useDefaultStyles ? 'text-[var(--foreground-secondary)] bg-[var(--surface)]' : ''
                  }`}
                  style={useDefaultStyles ? {} : { 
                    color: primaryColor,
                    backgroundColor: `${primaryColor}05`
                  }}
                >
                  <span className="sr-only">Ações</span>
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    px-4 py-4 text-left text-sm font-semibold
                    ${column.width ? column.width : ""}
                    ${useDefaultStyles ? 'text-[var(--foreground-secondary)] bg-[var(--surface)]' : ''}
                  `}
                  style={useDefaultStyles ? {
                    width: column.width || 'auto'
                  } : { 
                    color: titleColor || primaryColor,
                    backgroundColor: backgroundColor ? `${backgroundColor}05` : `${primaryColor}05`,
                    width: column.width || 'auto'
                  }}
                >
                  {column.label}
                </th>
              ))}
              {!actionsFirst && actions && (
                <th 
                  className={`px-4 py-4 text-right w-[140px] ${
                    useDefaultStyles ? 'text-[var(--foreground-secondary)] bg-[var(--surface)]' : ''
                  }`}
                  style={useDefaultStyles ? {} : { 
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
            className={useDefaultStyles ? '' : 'divide-y'}
            style={useDefaultStyles ? {} : {
              borderColor: borderColor ? `${borderColor}30` : `${primaryColor}10`
            }}
          >
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`transition-colors ${
                    useDefaultStyles ? 'hover:bg-[var(--surface-hover)]' : ''
                  }`}
                  style={useDefaultStyles ? {
                    backgroundColor: rowIndex % 2 === 0 ? 'var(--background)' : 'var(--surface)'
                  } : {
                    backgroundColor: rowIndex % 2 === 0 
                      ? (backgroundColor || 'white') 
                      : (borderColor ? `${borderColor}08` : `${primaryColor}02`)
                  }}
                  onMouseEnter={useDefaultStyles ? undefined : (e) => {
                    e.currentTarget.style.backgroundColor = borderColor 
                      ? `${borderColor}15` 
                      : `${primaryColor}05`;
                  }}
                  onMouseLeave={useDefaultStyles ? undefined : (e) => {
                    e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 
                      ? (backgroundColor || 'white') 
                      : (borderColor ? `${borderColor}08` : `${primaryColor}02`);
                  }}
                >
                  {actionsFirst && actions && (
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {actions
                          .filter(action => !action.show || action.show(item))
                          .map((action, actionIndex) => {
                            const Icon = action.icon;
                            const color = action.color || "primary";

                            if (useDefaultStyles) {
                              // Design system padrão para seller
                              return (
                                <button
                                  key={actionIndex}
                                  onClick={() => action.onClick(item)}
                                  className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
                                    color === 'primary' ? 'text-[var(--primary)] hover:bg-[var(--primary-hover)]' :
                                    color === 'secondary' ? 'text-[var(--secondary)] hover:bg-[var(--secondary-hover)]' :
                                    color === 'error' ? 'text-red-600 hover:bg-red-50' :
                                    'text-[var(--secondary)] hover:bg-[var(--secondary-hover)]'
                                  }`}
                                  title={action.label}
                                >
                                  <Icon size={16} className="sm:w-5 sm:h-5" />
                                  <span className="sr-only">{action.label}</span>
                                </button>
                              );
                            }

                            // Design personalizado para customer - usar cor secundária como padrão
                            return (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-opacity-10 transition-colors cursor-pointer"
                                style={{
                                  color: color === 'primary' ? primaryColor : 
                                         color === 'secondary' ? secondaryColor : 
                                         color === 'error' ? '#dc2626' : secondaryColor || primaryColor
                                }}
                                onMouseEnter={(e) => {
                                  const bgColor = color === 'primary' ? primaryColor : 
                                                color === 'secondary' ? secondaryColor : 
                                                color === 'error' ? '#dc2626' : secondaryColor || primaryColor;
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
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 py-4 text-sm ${
                        useDefaultStyles ? '' : 'border-r'
                      } ${
                        useDefaultStyles ? 'text-[var(--foreground)]' : ''
                      }`}
                      style={useDefaultStyles ? {
                        width: column.width || 'auto',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      } : { 
                        color: titleColor ? `${titleColor}E6` : '#374151', // 90% opacity
                        width: column.width || 'auto',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        borderColor: colIndex < columns.length - 1 
                          ? (borderColor ? `${borderColor}20` : `${primaryColor}10`)
                          : 'transparent'
                      }}
                    >
                      {column.render ? column.render(item[column.key], item) : String(item[column.key])}
                    </td>
                  ))}
                  {!actionsFirst && actions && (
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {actions
                          .filter(action => !action.show || action.show(item))
                          .map((action, actionIndex) => {
                            const Icon = action.icon;
                            const color = action.color || "primary";

                            if (useDefaultStyles) {
                              // Design system padrão para seller
                              return (
                                <button
                                  key={actionIndex}
                                  onClick={() => action.onClick(item)}
                                  className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
                                    color === 'primary' ? 'text-[var(--primary)] hover:bg-[var(--primary-hover)]' :
                                    color === 'secondary' ? 'text-[var(--secondary)] hover:bg-[var(--secondary-hover)]' :
                                    color === 'error' ? 'text-red-600 hover:bg-red-50' :
                                    'text-[var(--secondary)] hover:bg-[var(--secondary-hover)]'
                                  }`}
                                  title={action.label}
                                >
                                  <Icon size={16} className="sm:w-5 sm:h-5" />
                                  <span className="sr-only">{action.label}</span>
                                </button>
                              );
                            }

                            // Design personalizado para customer - usar cor secundária como padrão
                            return (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-opacity-10 transition-colors cursor-pointer"
                                style={{
                                  color: color === 'primary' ? primaryColor : 
                                         color === 'secondary' ? secondaryColor : 
                                         color === 'error' ? '#dc2626' : secondaryColor || primaryColor
                                }}
                                onMouseEnter={(e) => {
                                  const bgColor = color === 'primary' ? primaryColor : 
                                                color === 'secondary' ? secondaryColor : 
                                                color === 'error' ? '#dc2626' : secondaryColor || primaryColor;
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
                  className={`px-6 py-8 text-center text-sm ${
                    useDefaultStyles ? 'text-[var(--foreground-secondary)]' : ''
                  }`}
                  style={useDefaultStyles ? {} : { 
                    color: titleColor ? `${titleColor}E6` : '#6b7280' // 90% opacity
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação - fora do scroll */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div 
            className={`text-sm ${useDefaultStyles ? 'text-[var(--foreground)]' : ''}`}
            style={useDefaultStyles ? {} : { color: '#374151' }}
          >
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                useDefaultStyles ? 'text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]' : ''
              }`}
              style={useDefaultStyles ? {} : { 
                color: '#374151',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={useDefaultStyles ? undefined : (e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                  e.currentTarget.style.color = primaryColor;
                }
              }}
              onMouseLeave={useDefaultStyles ? undefined : (e) => {
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
              className={`p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                useDefaultStyles ? 'text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]' : ''
              }`}
              style={useDefaultStyles ? {} : { 
                color: '#374151',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={useDefaultStyles ? undefined : (e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                  e.currentTarget.style.color = primaryColor;
                }
              }}
              onMouseLeave={useDefaultStyles ? undefined : (e) => {
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