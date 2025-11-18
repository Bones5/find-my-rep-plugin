import '@testing-library/jest-dom';

// Mock WordPress i18n functions
declare global {
  // eslint-disable-next-line no-var
  var wp: {
    i18n: {
      __: (text: string) => string;
      _x: (text: string) => string;
      _n: (singular: string, plural: string, number: number) => string;
    };
  };
}

global.wp = {
  i18n: {
    __: (text: string) => text,
    _x: (text: string) => text,
    _n: (singular: string, plural: string, number: number) => number === 1 ? singular : plural,
  },
};

export {};
