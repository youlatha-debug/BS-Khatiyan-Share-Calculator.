
export interface LandUnits {
  ana: number;
  ganda: number;
  kara: number;
  kranti: number;
  til: number;
}

export interface Owner {
  id: string;
  name: string;
  share: LandUnits;
  soldDecimal: number;
  isSelling: boolean;
}

export interface CalculationResult {
  ownerId: string;
  ownerName: string;
  originalTil: number;
  originalLand: number;
  soldDecimal: number;
  remainingLand: number;
  hazariShare: number;
  relativeHazariShare: number;
  formattedShare: string;
  formattedRemainingShare: string;
}
