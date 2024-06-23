import { faker } from '@faker-js/faker';

/**
 * A modified faker implementation that provides
 * helper methods to create camp, meals, and recipes.
 */
type eMealFaker = typeof faker & {
  camp: {
    name: () => string;
    motto: () => string;
  };
};

const camp_types = [
  'Sommerlager',
  'Winterlager',
  'Pfingstlager',
  'Auffahrtslager',
  'Herbstlager',
  'Osterlager',
  'Ferienlager',
  'Klassenlager',
  'Schullager',
  'SoLa',
  'WiLa',
  'PfLa',
  'HeLa',
  'AuLa',
];

const organizations = [
  'Cevi Schweiz',
  'Pfadi Schweiz',
  'Cevi Züri 11',
  'ZH11',
  'Cevi Altstetten',
  'Cevi Züri 10',
  'Cevi Schwamendingen',
  'Cevi Zumikon-Neumünster',
  'Cevi Zürich',
  'Cevi Wädenswil-Au',
];

const mottos = [
  'Harry Potter',
  'Star Wars',
  'Lord of the Rings',
  'Pirates of the Caribbean',
  'David gegen Goliath',
  'Die Schöne und das Biest',
  'Robin Hood',
  'Die drei Musketiere',
  'Die Schatzinsel',
  'Die unendliche Geschichte',
  'Die Tribute von Panem',
  'Der Herr der Ringe',
  'Der Hobbit',
  'Die Chroniken von Narnia',
  'Die Legende von Aang',
  'Die Eiskönigin',
  'Die drei Fragezeichen',
  'Die wilden Kerle',
];

const eMealFaker = faker as eMealFaker;

// define modifications
eMealFaker.camp = {
  name: () =>
    `${faker.helpers.arrayElement(camp_types)} ${faker.helpers.arrayElement(
      organizations
    )}`,
  motto: () =>
    `'${faker.helpers.arrayElement(mottos)}' Lager in ${faker.location.city()}`,
};

export { eMealFaker };
