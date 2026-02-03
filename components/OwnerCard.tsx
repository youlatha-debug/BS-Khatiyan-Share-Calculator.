
import React from 'react';
import { Owner, LandUnits } from '../types';
import UnitInput from './UnitInput';

interface OwnerCardProps {
  owner: Owner;
  onUpdate: (id: string, updates: Partial<Owner>) => void;
  onRemove: (id: string) => void;
}

const OwnerCard: React.FC<OwnerCardProps> = ({ owner, onUpdate, onRemove }) => {
  const handleShareChange = (field: keyof LandUnits, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    onUpdate(owner.id, {
      share: { ...owner.share, [field]: numValue },
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4 relative group">
      <button
        onClick={() => onRemove(owner.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        title="Remove Owner"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1">মালিকের নাম (Owner Name)</label>
          <input
            type="text"
            value={owner.name}
            onChange={(e) => onUpdate(owner.id, { name: e.target.value })}
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <UnitInput
        label="অংশ (Share in Ana/Ganda)"
        values={owner.share}
        onChange={handleShareChange}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`sold-${owner.id}`}
          checked={owner.isSelling}
          onChange={(e) => onUpdate(owner.id, { isSelling: e.target.checked })}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor={`sold-${owner.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
          জমি বিক্রি করেছেন? (Sold land?)
        </label>
      </div>

      {owner.isSelling && (
        <div className="p-4 bg-red-50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
          <label className="block text-sm font-bold text-red-800">বিক্রিত পরিমাণ (শতক / Decimals)</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              value={owner.soldDecimal || ''}
              onChange={(e) => onUpdate(owner.id, { soldDecimal: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-red-200 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-400 text-xs font-bold">
              শতক
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerCard;
