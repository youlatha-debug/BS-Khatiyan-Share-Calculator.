
import React, { useState, useCallback, useMemo } from 'react';
import { Owner, LandUnits, CalculationResult } from './types';
import { TOTAL_TIL_IN_FULL_SHARE } from './constants';
import { unitsToTil, formatLandUnits, tilToUnits, formatDecimal } from './utils';
import UnitInput from './components/UnitInput';
import OwnerCard from './components/OwnerCard';

const INITIAL_UNITS: LandUnits = { ana: 0, ganda: 0, kara: 0, kranti: 0, til: 0 };

const App: React.FC = () => {
  const [totalLandArea, setTotalLandArea] = useState<number>(0);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [results, setResults] = useState<CalculationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [hazariMode, setHazariMode] = useState<'total' | 'remaining'>('total');

  const addOwner = () => {
    const newOwner: Owner = {
      id: Math.random().toString(36).substr(2, 9),
      name: `মালিক ${owners.length + 1}`,
      share: { ...INITIAL_UNITS },
      soldDecimal: 0,
      isSelling: false,
    };
    setOwners([...owners, newOwner]);
    setResults(null);
  };

  const updateOwner = (id: string, updates: Partial<Owner>) => {
    setOwners(owners.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    setResults(null);
  };

  const removeOwner = (id: string) => {
    setOwners(owners.filter((o) => o.id !== id));
    setResults(null);
  };

  const resetForm = () => {
    setTotalLandArea(0);
    setOwners([]);
    setResults(null);
    setError(null);
    setWarning(null);
  };

  const calculate = () => {
    setError(null);
    setWarning(null);

    if (totalLandArea <= 0) {
      setError('দয়া করে খতিয়ানের মোট জমি সঠিকভাবে লিখুন।');
      return;
    }

    if (owners.length === 0) {
      setError('দয়া করে কমপক্ষে একজন মালিক যোগ করুন।');
      return;
    }

    let totalOriginalTil = 0;
    
    // Step 1: Calculate basic land and remaining land for everyone
    const tempResults = owners.map((owner) => {
      const originalTil = unitsToTil(owner.share);
      totalOriginalTil += originalTil;

      const originalLand = (originalTil / TOTAL_TIL_IN_FULL_SHARE) * totalLandArea;
      const soldAmount = owner.isSelling ? owner.soldDecimal : 0;
      const remainingLand = Math.max(0, originalLand - soldAmount);

      return {
        owner,
        originalTil,
        originalLand,
        soldAmount,
        remainingLand
      };
    });

    // Check for warning instead of blocking error
    if (totalOriginalTil > TOTAL_TIL_IN_FULL_SHARE) {
      setWarning(`সতর্কতা: শেয়ারের যোগফল ১৬ আনার (${TOTAL_TIL_IN_FULL_SHARE} তিল) চেয়ে বেশি (${totalOriginalTil} তিল) হয়েছে।`);
    }

    const totalRemainingLandAcrossOwners = tempResults.reduce((sum, r) => sum + r.remainingLand, 0);

    // Step 2: Finalize calculation results with both hazari modes
    const calcResults: CalculationResult[] = tempResults.map((r) => {
      const { owner, originalTil, originalLand, soldAmount, remainingLand } = r;

      // Standard Hazari: based on original total land
      const hazariShare = (remainingLand / totalLandArea) * 1000;
      
      // Relative Hazari: based on only the land that actually remains
      const relativeHazariShare = totalRemainingLandAcrossOwners > 0 
        ? (remainingLand / totalRemainingLandAcrossOwners) * 1000 
        : 0;

      const remainingTilValue = (remainingLand / totalLandArea) * TOTAL_TIL_IN_FULL_SHARE;
      const remainingUnits = tilToUnits(Math.round(remainingTilValue));

      return {
        ownerId: owner.id,
        ownerName: owner.name,
        originalTil,
        originalLand,
        soldDecimal: soldAmount,
        remainingLand,
        hazariShare,
        relativeHazariShare,
        formattedShare: formatLandUnits(owner.share),
        formattedRemainingShare: formatLandUnits(remainingUnits),
      };
    });

    setResults(calcResults);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const totals = useMemo(() => {
    if (!results) return null;
    const totalRemLand = results.reduce((acc, r) => acc + r.remainingLand, 0);
    const totalHazari = results.reduce((acc, r) => acc + r.hazariShare, 0);
    const totalRelativeHazari = results.reduce((acc, r) => acc + r.relativeHazariShare, 0);
    const totalSold = results.reduce((acc, r) => acc + r.soldDecimal, 0);
    return { totalRemLand, totalHazari, totalRelativeHazari, totalSold };
  }, [results]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-3xl mx-auto space-y-8 flex-grow w-full">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-indigo-900 font-['Hind_Siliguri']">
            বিএস খতিয়ান অংশ ক্যালকুলেটর
          </h1>
          <p className="text-gray-600 font-medium">BS Khatiyan Share & Hazari Converter</p>
        </div>

        {/* Main Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                খতিয়ানের মোট জমি (Total Land)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalLandArea || ''}
                  onChange={(e) => setTotalLandArea(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 100"
                  className="w-full pl-3 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400 font-medium">শতক</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-end">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                  এখানে আপনি খতিয়ানের আনা-গন্ডা শেয়ার এবং বিক্রিত অংশ **শতক (Decimal)** হিসেবে ইনপুট দিতে পারবেন।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Owners Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              মালিকদের তালিকা
            </h2>
            <button
              onClick={addOwner}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95 font-semibold text-sm"
            >
              + মালিক যোগ করুন
            </button>
          </div>

          <div className="space-y-4">
            {owners.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <p className="text-gray-400">কোন মালিক যোগ করা হয়নি।</p>
              </div>
            ) : (
              owners.map((owner) => (
                <OwnerCard
                  key={owner.id}
                  owner={owner}
                  onUpdate={updateOwner}
                  onRemove={removeOwner}
                />
              ))
            )}
          </div>
        </div>

        {/* Form Controls */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-4 bg-gray-50 bg-opacity-90 backdrop-blur-sm p-2 rounded-xl z-10">
          <button
            onClick={calculate}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 font-bold text-lg"
          >
            হিসাব করুন
          </button>
          <button
            onClick={resetForm}
            className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all font-bold"
          >
            রিসেট
          </button>
        </div>

        {/* Error/Warning Messages */}
        <div className="space-y-2">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}
          {warning && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md flex items-center gap-3">
              <p className="text-amber-700 font-medium">{warning}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div id="results-section" className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden animate-results-entry">
            <div className="bg-indigo-900 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-bold text-white">হিসাবের ফলাফল</h3>
              
              {/* Hazari Mode Toggle */}
              <div className="bg-indigo-800 p-1 rounded-lg flex gap-1">
                <button 
                  onClick={() => setHazariMode('total')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${hazariMode === 'total' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
                >
                  মোট জমির ভিত্তিতে
                </button>
                <button 
                  onClick={() => setHazariMode('remaining')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${hazariMode === 'remaining' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
                >
                  অবশিষ্ট জমির ভিত্তিতে
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                  <p className="text-[10px] text-green-600 font-bold uppercase mb-1">অবশিষ্ট মোট জমি</p>
                  <p className="text-xl font-black text-green-900">{formatDecimal(totals?.totalRemLand || 0)} শতক</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
                  <p className="text-[10px] text-rose-600 font-bold uppercase mb-1">মোট বিক্রিত জমি</p>
                  <p className="text-xl font-black text-rose-900">{formatDecimal(totals?.totalSold || 0)} শতক</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                  <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">
                    মোট হাজারী ({hazariMode === 'total' ? 'খতিয়ান' : 'অবশিষ্ট'})
                  </p>
                  <p className="text-xl font-black text-blue-900">
                    {formatDecimal(hazariMode === 'total' ? (totals?.totalHazari || 0) : (totals?.totalRelativeHazari || 0), 0)} / ১০০০
                  </p>
                </div>
              </div>

              {/* Information Alert */}
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                <div className="text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <p className="text-xs text-amber-800 font-medium">
                  {hazariMode === 'total' 
                    ? "হাজারী হিস্যা খতিয়ানের মূল ১০০% জমির সাপেক্ষে দেখানো হচ্ছে।" 
                    : "হাজারী হিস্যা বর্তমানে অবশিষ্ট থাকা মোট জমির (১০০%) সাপেক্ষে সমন্বয় করা হয়েছে।"}
                </p>
              </div>

              {/* Individual Result Cards */}
              <div className="space-y-4">
                {results.map((res) => (
                  <div key={res.ownerId} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                      <h4 className="text-lg font-bold text-indigo-900">{res.ownerName}</h4>
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                        হাজারী: {formatDecimal(hazariMode === 'total' ? res.hazariShare : res.relativeHazariShare, 3)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">মূল খতিয়ান অংশ:</span>
                          <span className="font-semibold">{res.formattedShare}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">মূল জমি:</span>
                          <span className="font-semibold">{formatDecimal(res.originalLand, 3)} শতক</span>
                        </div>
                        {res.soldDecimal > 0 && (
                          <div className="flex justify-between text-sm text-red-600">
                            <span>বিক্রিত (শতক):</span>
                            <span className="font-bold">- {formatDecimal(res.soldDecimal, 2)} শতক</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col justify-center items-center shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">অবশিষ্ট জমি</p>
                        <p className="text-lg font-black text-indigo-600">{formatDecimal(res.remainingLand, 4)} শতক</p>
                        <p className="text-[10px] text-gray-500 mt-1">{res.formattedRemainingShare}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center border-t border-gray-200">
        <a 
          href="https://www.facebook.com/share/182w1cwm2y/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group"
        >
          <span className="text-sm font-medium">Power by</span>
          <span className="text-lg font-bold font-['Inter'] group-hover:underline">Youlath</span>
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      </footer>
    </div>
  );
};

export default App;
