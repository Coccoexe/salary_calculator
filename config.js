const TAX_CONFIG = {
  // data aggiornamento config
  updated: '05 Marzo 2026',

  // contributi lavoratore dipendente
  inpsEmployeeRate: 0.0919,
  inpsPublicRate: 0.080,

  // scaglioni IRPEF
  irpefBrackets: [
    { min: 0, max: 28000, rate: 0.23 },
    { min: 28000, max: 50000, rate: 0.35 },
    { min: 50000, max: Infinity, rate: 0.43 }
  ]

};