// variabili globali
let chart = null;
let salaryData = null;
let currentMode = "annual"; // default annuale

// calcola i valori e salva in salaryData
function calculate() {
  const ral = parseFloat(document.getElementById("ral").value);
  const municipalRate = parseFloat(document.getElementById("municipal").value) / 100;
  const regionalRate = parseFloat(document.getElementById("regional").value) / 100;
  const mensilita = parseInt(document.getElementById("mensilita").value);
  const pubblico = parseInt(document.getElementById("pubblico").value) === 0 ? TAX_CONFIG.inpsEmployeeRate : TAX_CONFIG.inpsPublicRate;

  if (!ral) { alert("Inserisci la RAL"); return; }
  if (!municipalRate) { alert("Inserisci l'addizionale comunale"); return; }
  if (!regionalRate) { alert("Inserisci l'addizionale regionale"); return; }

  const inps                = ral * pubblico;                                               // contributi INPS
  const imponibileIrpef     = ral - inps;                                                   // imponibile IRPEF
  const irpefLorda          = calculateIrpef(imponibileIrpef);                              // IRPEF lordo
  const detrazioni          = TAX_CONFIG.deductions(irpefLorda);                            // detrazioni IRPEF
  const regionali           = imponibileIrpef * regionalRate;                               // addizionali regionali
  const comunali            = imponibileIrpef * municipalRate;                              // addizionali comunali
  const totaleRitenuteIrpef = Math.max(irpefLorda - detrazioni, 0) + regionali + comunali;  // ritenute IRPEF
  const nettoAnnuo          = ral - inps - totaleRitenuteIrpef;                             // netto annuo

  salaryData = {
    quotaInps: inps,
    imponibileIrpef: imponibileIrpef,
    irpefLorda: irpefLorda,
    detrazioniIrpef: detrazioni,
    addizionaliComunali: comunali,
    addizionaliRegionali: regionali,
    totaleRitenuteIrpef: totaleRitenuteIrpef,
    nettoAnnuo: nettoAnnuo,
    ral: ral,
    mensilita: mensilita
  };

  // aggiorna grafico e valori
  updateDisplay();
}

// Calcola l'IRPEF a scaglioni
// tassato al 23% i primi 28k
//            35% da 28k a 50k
//            43% i redditi sopra i 50k
// early stop se non rimane niente da tassare :)
function calculateIrpef(income) {
  let tax = 0;
  const brackets = TAX_CONFIG.irpefBrackets;

  for (const b of brackets) {
    const taxable = Math.min(income, b.max) - b.min;
    if (taxable > 0) {
      tax += taxable * b.rate;
    }
  }
  return tax;
}

// aggiorna valori e grafico
function updateDisplay() {
  if (!salaryData) return;

  let factor = 1;                     // fattore di divisione annuale o mensile
  if (currentMode === "monthly") {
    factor = 1 / salaryData.mensilita;
  }

  // mostra valori
  const lordo = currentMode === "annual" ? salaryData.ral : salaryData.ral / salaryData.mensilita;
  const netto = salaryData.nettoAnnuo * factor;
  const inps  = salaryData.quotaInps * factor;
  const imponibileIrpef = salaryData.imponibileIrpef * factor; 
  const irpefLorda = salaryData.irpefLorda * factor; 
  const detrazioniIrpef = salaryData.detrazioniIrpef * factor; 
  const comunali = salaryData.addizionaliComunali * factor; 
  const regionali = salaryData.addizionaliRegionali * factor; 
  const totaleRitenuteIrpef = salaryData.totaleRitenuteIrpef * factor; 

  const period = currentMode === "annual" ? "annuo" : "mensile";

  document.getElementById("results").innerHTML = `
  <div style="display: flex; flex-direction: column; gap: 4px;">
    <div style="display: flex; justify-content: space-between;">
      <span><b>Lordo ${period}:</b></span>
      <span style="text-align: right;">${lordo.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>INPS:</b></span>
      <span style="text-align: right;">- ${inps.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>Imponibile IRPEF:</b></span>
      <span style="text-align: right;">= ${imponibileIrpef.toFixed(2)} €</span>
    </div>
    <hr/>
    <div style="display: flex; justify-content: space-between;">
      <span><b>IRPEF Lordo:</b></span>
      <span style="text-align: right;">${irpefLorda.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>Detrazioni IRPEF:</b></span>
      <span style="text-align: right;">+ ${detrazioniIrpef.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>Addizionale regionale:</b></span>
      <span style="text-align: right;">- ${regionali.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>Addizionale comunale:</b></span>
      <span style="text-align: right;">- ${comunali.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>Totale IRPEF:</b></span>
      <span style="text-align: right;">= ${totaleRitenuteIrpef.toFixed(2)} €</span>
    </div>
    <hr/>
    <div style="display: flex; justify-content: space-between;">
      <span><b>Lordo ${period}:</b></span>
      <span style="text-align: right;">${lordo.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>INPS:</b></span>
      <span style="text-align: right;">- ${inps.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>Totale IRPEF:</b></span>
      <span style="text-align: right;">- ${totaleRitenuteIrpef.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span><b>Netto ${period}:</b></span>
      <span style="text-align: right;">= ${netto.toFixed(2)} €</span>
    </div>
  </div>
`;

  renderChart(netto, totaleRitenuteIrpef, inps);
}

// crea / aggiorna grafico doughnut
function renderChart(netto, totaleRitenuteIrpef, inps) {
  const ctx = document.getElementById("salaryChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Netto", "IRPEF", "INPS"],
      datasets: [{
        data: [netto, totaleRitenuteIrpef, inps],
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF9800"
        ]
      }]
    },
    options: {
      responsive: true,
      cutout: "60%",
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const perc = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ${context.raw.toFixed(2)} € (${perc}%)`;
            }
          }
        }
      }
    }
  });
}

// tab toggle annuale / mensile
document.querySelectorAll(".chart-mode-tabs .tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".chart-mode-tabs .tab").forEach(t => t.classList.remove("active"));  // rimuove active da tutti
    tab.classList.add("active");                                                                    // imposta active sul tab cliccato
    currentMode = tab.getAttribute("data-mode");
    updateDisplay();                                                                                // aggiorna dati
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("irpef-update").textContent =
    "Aliquote IRPEF aggiornate al " + TAX_CONFIG.updated;
});