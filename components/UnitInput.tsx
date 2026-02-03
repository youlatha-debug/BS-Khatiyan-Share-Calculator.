
import React from 'react';
import { LandUnits } from '../types';

interface UnitInputProps {
  label: string;
  values: LandUnits;
  onChange: (field: keyof LandUnits, value: string) => void;
  className?: string;
}

const UnitInput: React.FC<UnitInputProps> = ({ label, values, onChange, className = "" }) => {
  const fields: { key: keyof LandUnits; label: string; placeholder: string }[] = [
    { key: 'ana', label: 'আনা (Ana)', placeholder: '0' },
    { key: 'ganda', label: 'গন্ডা (Ganda)', placeholder: '0' },
    { key: 'kara', label: 'করা (Kara)', placeholder: '0' },
    { key: 'kranti', label: 'ক্রান্তি (Kranti)', placeholder: '0' },
    { key: 'til', label: 'তিল (Til)', placeholder: '0' },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="grid grid-cols-5 gap-2">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col">
            <input
              type="number"
              min="0"
              value={values[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <span className="text-[10px] text-gray-500 mt-1 text-center truncate">
              {field.label.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitInput;
