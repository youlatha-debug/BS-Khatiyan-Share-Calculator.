
/**
 * Bangladeshi Land Record (Khatiyan) standard conversion:
 * 1 Full Share = 16 Ana
 * 1 Ana = 20 Ganda
 * 1 Ganda = 4 Kara
 * 1 Kara = 3 Kranti
 * 1 Kranti = 20 Til
 * 
 * Total Til in 1 Full Share: 16 * 20 * 4 * 3 * 20 = 76,800
 */

export const CONVERSION = {
  ANA_TO_GANDA: 20,
  GANDA_TO_KARA: 4,
  KARA_TO_KRANTI: 3,
  KRANTI_TO_TIL: 20,
  TOTAL_ANA: 16,
};

export const TOTAL_TIL_IN_FULL_SHARE = 
  CONVERSION.TOTAL_ANA * 
  CONVERSION.ANA_TO_GANDA * 
  CONVERSION.GANDA_TO_KARA * 
  CONVERSION.KARA_TO_KRANTI * 
  CONVERSION.KRANTI_TO_TIL; // 76800
