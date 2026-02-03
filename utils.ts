
import { LandUnits } from './types';
import { CONVERSION, TOTAL_TIL_IN_FULL_SHARE } from './constants';

export const unitsToTil = (units: LandUnits): number => {
  const { ana, ganda, kara, kranti, til } = units;
  let total = ana;
  total = total * CONVERSION.ANA_TO_GANDA + ganda;
  total = total * CONVERSION.GANDA_TO_KARA + kara;
  total = total * CONVERSION.KARA_TO_KRANTI + kranti;
  total = total * CONVERSION.KRANTI_TO_TIL + til;
  return total;
};

export const tilToUnits = (totalTil: number): LandUnits => {
  let remaining = totalTil;
  
  const til = remaining % CONVERSION.KRANTI_TO_TIL;
  remaining = Math.floor(remaining / CONVERSION.KRANTI_TO_TIL);
  
  const kranti = remaining % CONVERSION.KARA_TO_KRANTI;
  remaining = Math.floor(remaining / CONVERSION.KARA_TO_KRANTI);
  
  const kara = remaining % CONVERSION.GANDA_TO_KARA;
  remaining = Math.floor(remaining / CONVERSION.GANDA_TO_KARA);
  
  const ganda = remaining % CONVERSION.ANA_TO_GANDA;
  remaining = Math.floor(remaining / CONVERSION.ANA_TO_GANDA);
  
  const ana = remaining;
  
  return { ana, ganda, kara, kranti, til };
};

export const formatLandUnits = (units: LandUnits): string => {
  const parts: string[] = [];
  if (units.ana > 0) parts.push(`${units.ana} আনা`);
  if (units.ganda > 0) parts.push(`${units.ganda} গন্ডা`);
  if (units.kara > 0) parts.push(`${units.kara} করা`);
  if (units.kranti > 0) parts.push(`${units.kranti} ক্রান্তি`);
  if (units.til > 0) parts.push(`${units.til} তিল`);
  return parts.length > 0 ? parts.join(', ') : '০';
};

export const formatDecimal = (num: number, fixed: number = 2): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: fixed,
    maximumFractionDigits: fixed,
  });
};
