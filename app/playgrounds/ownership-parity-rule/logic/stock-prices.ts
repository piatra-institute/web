import AAPL from './prices/AAPL.json';
import ADBE from './prices/ADBE.json';
import ADSK from './prices/ADSK.json';
import AMD from './prices/AMD.json';
import AMZN from './prices/AMZN.json';
import GOOG from './prices/GOOG.json';
import INTC from './prices/INTC.json';
import META from './prices/META.json';
import MSFT from './prices/MSFT.json';
import NFLX from './prices/NFLX.json';
import NVDA from './prices/NVDA.json';
import SONY from './prices/SONY.json';

export const SERIES: Record<string, { name: string; prices: Record<string, number> }> = {
  AAPL: {
    name: "Apple",
    prices: AAPL
  },
  NVDA: {
    name: "NVIDIA",
    prices: NVDA
  },
  INTC: {
    name: "Intel",
    prices: INTC
  },
  AMD: {
    name: "AMD",
    prices: AMD
  },
  MSFT: {
    name: "Microsoft",
    prices: MSFT
  },
  AMZN: {
    name: "Amazon",
    prices: AMZN
  },
  ADBE: {
    name: "Adobe",
    prices: ADBE
  },
  ADSK: {
    name: "Autodesk",
    prices: ADSK
  },
  META: {
    name: "Meta",
    prices: META
  },
  SONY: {
    name: "Sony",
    prices: SONY
  },
  NFLX: {
    name: "Netflix",
    prices: NFLX
  },
  GOOG: {
    name: "Google",
    prices: GOOG
  }
};
