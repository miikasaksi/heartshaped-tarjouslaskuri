const VAT_RATE = 0.255;

const DEFAULTS = {
  pricePerParticipant: 42,
  participants: 30,
  staffCount: 2,
  staffHourly: 20,
  employerPercent: 23,
  durationHours: 4,
  travelCosts: 35,
  extraCosts: 50,
};

function parseNumber(value) {
  const normalized = String(value).replace(",", ".").trim();
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatEuro(value) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getValues() {
  return {
    pricePerParticipant: parseNumber(document.getElementById("pricePerParticipant").value),
    participants: parseNumber(document.getElementById("participants").value),
    staffCount: parseNumber(document.getElementById("staffCount").value),
    staffHourly: parseNumber(document.getElementById("staffHourly").value),
    employerPercent: parseNumber(document.getElementById("employerPercent").value),
    durationHours: parseNumber(document.getElementById("durationHours").value),
    travelCosts: parseNumber(document.getElementById("travelCosts").value),
    extraCosts: parseNumber(document.getElementById("extraCosts").value),
  };
}

function calculateBreakdown(values) {
  const participantsTotal = values.pricePerParticipant * values.participants;
  const staffGross = values.staffCount * values.staffHourly * values.durationHours;
  const employerCosts = staffGross * (values.employerPercent / 100);
  const staffTotal = staffGross + employerCosts;
  const otherCosts = values.travelCosts + values.extraCosts;
  const subtotal = participantsTotal + staffTotal + otherCosts;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return {
    participantsTotal,
    staffGross,
    employerCosts,
    staffTotal,
    otherCosts,
    subtotal,
    vat,
    total,
  };
}

function renderSummary(result) {
  document.getElementById("participantsTotal").textContent = formatEuro(result.participantsTotal);
  document.getElementById("staffGross").textContent = formatEuro(result.staffGross);
  document.getElementById("employerCosts").textContent = formatEuro(result.employerCosts);
  document.getElementById("staffTotal").textContent = formatEuro(result.staffTotal);
  document.getElementById("otherCosts").textContent = formatEuro(result.otherCosts);
  document.getElementById("subtotal").textContent = formatEuro(result.subtotal);
  document.getElementById("vat").textContent = formatEuro(result.vat);
  document.getElementById("total").textContent = formatEuro(result.total);
}

function setDefaultValues() {
  Object.entries(DEFAULTS).forEach(([id, value]) => {
    document.getElementById(id).value = value;
  });
}

function clearSummary() {
  [
    "participantsTotal",
    "staffGross",
    "employerCosts",
    "staffTotal",
    "otherCosts",
    "subtotal",
    "vat",
    "total",
  ].forEach((id) => {
    document.getElementById(id).textContent = "-";
  });
}

function calculateAndRender() {
  const result = calculateBreakdown(getValues());
  renderSummary(result);
  document.getElementById("calculateBtn").textContent = "Laske uudelleen";
}

document.getElementById("calculatorForm").addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

document.getElementById("savePdfBtn").addEventListener("click", () => {
  calculateAndRender();
  window.print();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  setDefaultValues();
  clearSummary();
  document.getElementById("calculateBtn").textContent = "Laske tarjous";
});

calculateAndRender();
