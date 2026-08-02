// menu/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePublicTables } from '../lib/api/hooks/useMenu';
import { QrCodeIcon, ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const router = useRouter();
  const { data: tables, isLoading, error } = usePublicTables();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Debug log to see what's coming from the API
  console.log('Tables data:', tables);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  const filteredTables = tables?.filter((table: any) => {
    const search = searchTerm.toLowerCase();
    return table.name?.toLowerCase().includes(search) ||
           table.table_number?.toLowerCase().includes(search) ||
           table.slug?.toLowerCase().includes(search);
  });

  const handleGoToMenu = () => {
    if (selectedTable) {
      router.push(`/${selectedTable}`);
    }
  };

  // If there's only one table, auto-select it
  useEffect(() => {
    if (tables && tables.length === 1) {
      const table = tables[0];
      setSelectedTable(table.slug || table.id);
    }
  }, [tables]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#16302B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-body text-[#8A8377]">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#DDD5C4] p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="font-display text-2xl font-medium text-[#2A2622] mb-2">Unable to load tables</h2>
          <p className="font-body text-[#8A8377]">
            Please make sure the server is running and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#DDD5C4] p-8 max-w-md w-full shadow-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#16302B] to-[#1D3B34] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <QrCodeIcon className="h-10 w-10 text-[#F7F1E4]" />
          </div>
          <h1 className="font-display text-2xl font-medium text-[#2A2622]">
            Welcome to Classic Hotel
          </h1>
          <p className="font-body text-[#8A8377] mt-1">
            Select your table to view the menu
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-body w-full px-4 py-2 pl-10 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <MapPinIcon className="h-4 w-4 text-[#8A8377]" />
          </div>
        </div>

        {tables?.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-body text-[#8A8377]">No tables found</p>
            <p className="font-body text-sm text-[#8A8377]">Please check back later</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {filteredTables?.map((table: any) => {
                const tableId = table.slug || table.id;
                const isSelected = selectedTable === tableId;
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(tableId)}
                    className={`w-full font-body text-left px-4 py-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#C9A468] bg-[#F7F1E4] shadow-sm'
                        : 'border-[#DDD5C4] hover:border-[#C9A468] hover:bg-[#F7F1E4]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[#2A2622]">Table {table.table_number}</span>
                        <span className="text-sm text-[#8A8377] ml-2">• {table.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          table.status === 'available' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                          table.status === 'occupied' ? 'bg-[#FCE4EC] text-[#C62828]' :
                          table.status === 'reserved' ? 'bg-[#FFF3E0] text-[#E65100]' :
                          'bg-[#DBEAFE] text-[#0D47A1]'
                        }`}>
                          {table.status}
                        </span>
                        {isSelected && (
                          <span className="text-[#C9A468]">✓</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleGoToMenu}
              disabled={!selectedTable}
              className={`font-body w-full px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                selectedTable
                  ? 'bg-gradient-to-r from-[#16302B] to-[#1D3B34] text-[#F7F1E4] hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-[#DDD5C4] text-[#8A8377] cursor-not-allowed'
              }`}
            >
              {selectedTable ? 'View Menu' : 'Select a Table'}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </>
        )}

        <p className="font-body text-xs text-[#8A8377] text-center mt-4">
          🔍 Scan the QR code on your table for quick access
        </p>
      </div>
    </div>
  );
}