import * as admin from 'firebase-admin';

import { db } from '.';


// TODO: Einheiten umrechnen können... wichtige Foodelemente
// müssen in andere Einheiten umgerechnet werden könne.
// z.B. Liter in Esslöffel...

/**
 * interface for the unitLookUpTable
 */
interface UnitLookUpTable {

  [unit: string]: {
    factor: number;
    baseUnit: string;
  };

}

/**
 * 
 * units in this list can be converted to a global baseUnit
 * every supproted unit must be listed in this table
 * 
 */
const unitLookUp: UnitLookUpTable = {};

/** Error: Can't convert unit! */
export class UnitConvertionError extends Error { }


/**
 * converts any unit to it's base unit,
 * this convertion is based on the unitLookUpTable
 *
 * @param measure measure in unit
 * @param unit unit of the measure
 *
 * @return measure in baseUnit and the baseUnit
 *
 */
export function toUnitMeasure(measure: number, unit: string): { measure: number, unit: string } {

  // removes unnecissary spaces
  let newUnit = unit.trim().replace(/[\r\n]+/gm, '');

  // throw an error on unknown unit
  if (!unitLookUp[unit]) {

    // write unknown unit to document in 'sharedData/unknownUnits'
    db.doc('sharedData/unknownUnits')
      .update({ units: admin.firestore.FieldValue.arrayUnion(unit) })
      .catch(e => console.error(e));

    throw new UnitConvertionError('Unknown unit: ' + unit);

  }

  // convert unit based on unitLookUpTable
  // update unit to baseUnit
  const newMeasure = measure * unitLookUp[unit].factor;
  newUnit = unitLookUp[unit].baseUnit;

  return { measure: newMeasure, unit: newUnit };

}
