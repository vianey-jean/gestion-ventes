/**
 * ClientPagination — Pagination premium pour la grille des clients.
 */
import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const ClientPagination: React.FC<Props> = ({ currentPage, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const middle = Array.from({ length: 3 }, (_, i) => currentPage - 1 + i).filter(p => p > 1 && p < totalPages);

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-12 mb-8 px-4">
      <Button variant="outline" size="sm" onClick={() => onChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 font-semibold">
        <span className="hidden sm:inline">← Précédent</span><span className="sm:hidden">←</span>
      </Button>
      <div className="flex items-center gap-2">
        <Button variant={currentPage === 1 ? 'default' : 'outline'} size="sm" onClick={() => onChange(1)} className={`min-w-[40px] font-bold transition-all ${currentPage === 1 ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg scale-110' : 'border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}>1</Button>
        {currentPage > 4 && <span className="px-2 text-lg font-bold text-gray-400 dark:text-gray-500">…</span>}
        {middle.map(page => (
          <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => onChange(page)} className={`min-w-[40px] font-bold transition-all ${currentPage === page ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg scale-110' : 'border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}>{page}</Button>
        ))}
        {currentPage < totalPages - 3 && <span className="px-2 text-lg font-bold text-gray-400 dark:text-gray-500">…</span>}
        {totalPages > 1 && (
          <Button variant={currentPage === totalPages ? 'default' : 'outline'} size="sm" onClick={() => onChange(totalPages)} className={`min-w-[40px] font-bold transition-all ${currentPage === totalPages ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg scale-110' : 'border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}>{totalPages}</Button>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => onChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 font-semibold">
        <span className="hidden sm:inline">Suivant →</span><span className="sm:hidden">→</span>
      </Button>
    </div>
  );
};

export default ClientPagination;
