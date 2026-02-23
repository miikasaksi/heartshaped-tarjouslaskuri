const VAT_RATE = 0.255;
const EMPLOYER_PERCENT = 23;
const TAXI_RATE_PER_KM = 1.5;
const ROUND_TRIP_MULTIPLIER = 2;

const DEFAULTS = {
  pricingModel: "54",
  customPricePerParticipant: "",
  participants: 30,
  staffCount: 2,
  staffHourly: 20,
  durationHours: 4,
  travelKmOneWay: 0,
  extraCosts: 50,
};

function isEmbedded() {
  return new URLSearchParams(window.location.search).get("embed") === "1";
}

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

function getPricePerParticipant() {
  const model = document.getElementById("pricingModel").value;
  if (model === "custom") {
    return parseNumber(document.getElementById("customPricePerParticipant").value);
  }
  return parseNumber(model);
}

function updatePricingUi() {
  const model = document.getElementById("pricingModel").value;
  const customInput = document.getElementById("customPricePerParticipant");
  const showCustom = model === "custom";

  customInput.classList.toggle("is-hidden", !showCustom);
  if (showCustom) {
    customInput.focus();
  }

  sendEmbedHeight();
}

function getValues() {
  return {
    pricePerParticipant: getPricePerParticipant(),
    participants: parseNumber(document.getElementById("participants").value),
    staffCount: parseNumber(document.getElementById("staffCount").value),
    staffHourly: parseNumber(document.getElementById("staffHourly").value),
    durationHours: parseNumber(document.getElementById("durationHours").value),
    travelKmOneWay: parseNumber(document.getElementById("travelKmOneWay").value),
    extraCosts: parseNumber(document.getElementById("extraCosts").value),
  };
}

function calculateBreakdown(values) {
  const participantsTotal = values.pricePerParticipant * values.participants;
  const staffGross = values.staffCount * values.staffHourly * values.durationHours;
  const employerCosts = staffGross * (EMPLOYER_PERCENT / 100);
  const staffTotal = staffGross + employerCosts;
  const travelCosts = values.travelKmOneWay * TAXI_RATE_PER_KM * ROUND_TRIP_MULTIPLIER;
  const extrasTotal = values.extraCosts;
  const subtotal = participantsTotal + staffTotal + travelCosts + extrasTotal;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return {
    participantsTotal,
    staffGross,
    employerCosts,
    staffTotal,
    travelCosts,
    extrasTotal,
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
  document.getElementById("travelTotal").textContent = formatEuro(result.travelCosts);
  document.getElementById("extrasTotal").textContent = formatEuro(result.extrasTotal);
  document.getElementById("subtotal").textContent = formatEuro(result.subtotal);
  document.getElementById("vat").textContent = formatEuro(result.vat);
  document.getElementById("total").textContent = formatEuro(result.total);
}

function setDefaultValues() {
  Object.entries(DEFAULTS).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    element.value = value;
  });
}

function clearSummary() {
  [
    "participantsTotal",
    "staffGross",
    "employerCosts",
    "staffTotal",
    "travelTotal",
    "extrasTotal",
    "subtotal",
    "vat",
    "total",
  ].forEach((id) => {
    document.getElementById(id).textContent = "-";
  });
}

function sendEmbedHeight() {
  if (window.parent === window) {
    return;
  }

  const root = document.documentElement;
  const height = Math.ceil(
    Math.max(root.scrollHeight, document.body ? document.body.scrollHeight : 0),
  );

  window.parent.postMessage(
    {
      type: "heartshaped-calculator-height",
      height,
    },
    "*",
  );
}

function calculateAndRender() {
  const result = calculateBreakdown(getValues());
  renderSummary(result);
  document.getElementById("calculateBtn").textContent = "Laske uudelleen";
  sendEmbedHeight();
}

document.getElementById("calculatorForm").addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

document.getElementById("pricingModel").addEventListener("change", () => {
  updatePricingUi();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  setDefaultValues();
  updatePricingUi();
  clearSummary();
  document.getElementById("calculateBtn").textContent = "Laske tarjous";
  sendEmbedHeight();
});

if (isEmbedded()) {
  document.body.classList.add("embed");
}

setDefaultValues();
updatePricingUi();
calculateAndRender();

window.addEventListener("load", sendEmbedHeight);
window.addEventListener("resize", sendEmbedHeight);

const observer = new MutationObserver(() => {
  sendEmbedHeight();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
});
