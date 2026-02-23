const VAT_RATE = 0.255;
const TODAY_FI = new Intl.DateTimeFormat("fi-FI").format(new Date());

const DEFAULTS = {
  pricePerParticipant: 42,
  participants: 30,
  staffCount: 2,
  staffHourly: 20,
  employerPercent: 23,
  durationHours: 4,
  travelCosts: 35,
  extraCosts: 50,
  clientName: "",
  eventName: "Koru-workshop",
  eventDate: "",
  offerDate: TODAY_FI,
};

function isEmbedded() {
  return new URLSearchParams(window.location.search).get("embed") === "1";
}

function parseNumber(value) {
  const normalized = String(value).replace(",", ".").trim();
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function cleanText(value, fallback = "") {
  const text = String(value || "").trim();
  return text.length > 0 ? text : fallback;
}

function formatEuro(value) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  return `${new Intl.NumberFormat("fi-FI", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} %`;
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

function getMeta() {
  return {
    clientName: cleanText(document.getElementById("clientName")?.value, "Asiakas"),
    eventName: cleanText(document.getElementById("eventName")?.value, "Koru-workshop"),
    eventDate: cleanText(document.getElementById("eventDate")?.value, "Sovitaan erikseen"),
    offerDate: cleanText(document.getElementById("offerDate")?.value, TODAY_FI),
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
    "otherCosts",
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

function textLines(doc, text, maxWidth) {
  return doc.splitTextToSize(String(text), maxWidth);
}

function drawValueRow(doc, x, y, width, label, value, isBold = false) {
  doc.setDrawColor(228, 213, 224);
  doc.line(x, y + 2.5, x + width, y + 2.5);

  doc.setFont("helvetica", isBold ? "bold" : "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 63, 78);
  doc.text(label, x + 1, y);

  doc.setFont("helvetica", "bold");
  doc.text(value, x + width - 1, y, { align: "right" });
}

function drawOfferCover(doc, meta) {
  doc.setFillColor(70, 104, 226);
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("HEART SHAPED STUDIO OY", 105, 20, { align: "center" });

  doc.setFillColor(0, 0, 0);
  doc.circle(100, 58, 3, "F");
  doc.circle(110, 58, 3, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("HEART SHAPED", 105, 74, { align: "center" });

  doc.setTextColor(248, 248, 252);
  doc.setFont("times", "normal");
  doc.setFontSize(30);
  doc.text("Heart Shaped Studio", 105, 122, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(24);
  const titleLines = textLines(doc, `${meta.eventName}\n${meta.clientName}`, 160);
  doc.text(titleLines, 105, 146, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(meta.offerDate, 105, 255, { align: "center" });
}

function drawOfferMainPage(doc, meta, values, result) {
  doc.addPage();
  doc.setFillColor(246, 245, 248);
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(24, 24, 27);
  doc.setFont("times", "normal");
  doc.setFontSize(18);
  doc.text("TARJOUS", 105, 24, { align: "center" });

  const leftX = 18;
  const leftWidth = 108;
  const rightX = 132;
  const rightWidth = 60;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const bulletItems = [
    `${meta.eventName} ${meta.clientName} -asiakkaalle.`,
    `Tapahtumapäivä: ${meta.eventDate}`,
    `Osallistujia noin: ${Math.round(values.participants)}`,
    `Henkilökunta: ${Math.round(values.staffCount)}`,
    `Kesto: ${new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 2 }).format(values.durationHours)} h`,
  ];

  let y = 38;
  for (const item of bulletItems) {
    const lines = textLines(doc, item, leftWidth - 8);
    doc.text("•", leftX, y);
    doc.text(lines, leftX + 6, y);
    y += lines.length * 6 + 3;
  }

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text("Tarjous:", leftX, y);

  y += 11;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${formatEuro(result.subtotal)} + ALV. 25,5 %`, leftX, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const includesText = textLines(
    doc,
    `Sisältää: ${Math.round(values.staffCount)} henkilöä avustamaan, materiaalit ${Math.round(values.participants)} osallistujalle sekä tapahtuman valmistelun ja purun.`,
    leftWidth,
  );
  doc.text(includesText, leftX, y);

  y += includesText.length * 5.2 + 8;
  const termsText = textLines(
    doc,
    "Maksuehdot: Laskutus 30 % etukäteen ja 70 % tapahtuman jälkeen. Tarjous voimassa 14 päivää.",
    leftWidth,
  );
  doc.text(termsText, leftX, y);

  doc.setDrawColor(229, 216, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightX, 37, rightWidth, 178, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(72, 53, 71);
  doc.text("HINTAERITTELY", rightX + rightWidth / 2, 47, { align: "center" });

  let rowY = 57;
  drawValueRow(doc, rightX + 4, rowY, rightWidth - 8, "Osallistujat", formatEuro(result.participantsTotal));
  rowY += 9;
  drawValueRow(doc, rightX + 4, rowY, rightWidth - 8, "Palkat", formatEuro(result.staffGross));
  rowY += 9;
  drawValueRow(doc, rightX + 4, rowY, rightWidth - 8, "Sivukulut", formatEuro(result.employerCosts));
  rowY += 9;
  drawValueRow(doc, rightX + 4, rowY, rightWidth - 8, "Henkilökunta", formatEuro(result.staffTotal));
  rowY += 9;
  drawValueRow(doc, rightX + 4, rowY, rightWidth - 8, "Muut kulut", formatEuro(result.otherCosts));
  rowY += 9;
  drawValueRow(doc, rightX + 4, rowY, rightWidth - 8, "Välisumma", formatEuro(result.subtotal));
  rowY += 9;
  drawValueRow(doc, rightX + 4, rowY, rightWidth - 8, "ALV 25,5 %", formatEuro(result.vat));
  rowY += 9;
  drawValueRow(doc, rightX + 4, rowY, rightWidth - 8, "Yhteensä", formatEuro(result.total), true);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  doc.setTextColor(99, 86, 99);
  const note = textLines(
    doc,
    `Laskelmassa työnantajakustannukset ${formatPercent(values.employerPercent)} ja ALV 25,5 %.`,
    rightWidth - 8,
  );
  doc.text(note, rightX + 4, 201);
}

function drawProcessPage(doc) {
  doc.addPage();
  doc.setFillColor(246, 245, 248);
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(31, 31, 35);
  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.text("NÄIN KORUPAJA TOIMII", 105, 28, { align: "center" });

  const steps = [
    {
      no: "1",
      title: "Valitaan helmet",
      body: "Asiakkaat valitsevat helmet ja kirjaimet omaan pieneen astiaan.",
      x: 36,
    },
    {
      no: "2",
      title: "Pujotus",
      body: "Helmet pujotetaan korulankaan helmineulan avulla avustettuna.",
      x: 105,
    },
    {
      no: "3",
      title: "Valmis koru",
      body: "Rannekoru, avaimenperä tai puhelinkoru valmistuu mukaan vietäväksi.",
      x: 174,
    },
  ];

  doc.setDrawColor(200, 200, 208);
  doc.setLineWidth(0.8);
  doc.line(49, 70, 92, 70);
  doc.line(118, 70, 161, 70);

  for (const step of steps) {
    doc.setFillColor(70, 104, 226);
    doc.circle(step.x, 56, 7.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(step.no, step.x, 58.5, { align: "center" });

    doc.setTextColor(45, 45, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(step.title, step.x, 92, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = textLines(doc, step.body, 54);
    doc.text(lines, step.x, 100, { align: "center" });
  }
}

function drawThankYouPage(doc) {
  doc.addPage();
  doc.setFillColor(246, 245, 248);
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(28, 28, 33);
  doc.setFont("times", "bold");
  doc.setFontSize(44);
  doc.text("Kiitos,", 105, 80, { align: "center" });
  doc.text("Thank You!", 105, 110, { align: "center" });

  doc.setTextColor(230, 92, 175);
  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.text("Hands on, phones off, heart shaped feelings.", 105, 135, { align: "center" });

  doc.setTextColor(50, 50, 56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Rebecca Anttila", 105, 183, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Founder", 105, 190, { align: "center" });
  doc.text("info@theheartshaped.com", 105, 198, { align: "center" });
  doc.text("+358 40 809 2035", 105, 205, { align: "center" });

  doc.setFontSize(9.8);
  doc.text("www.theheartshaped.com", 105, 220, { align: "center" });
  doc.text("Studio @ Punavuorenkatu 20, Helsinki", 105, 227, { align: "center" });
  doc.text("Heart Shaped Studio Oy (3358838-1)", 105, 234, { align: "center" });
}

function createPdfFileName(meta) {
  const cleanedClient = meta.clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const datePart = meta.offerDate
    .replace(/\s+/g, "-")
    .replace(/[^0-9a-zA-Z.-]/g, "-");

  return `Heart-Shaped_tarjous_${cleanedClient || "asiakas"}_${datePart || "paivays"}.pdf`;
}

function generateOfferPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF-kirjastoa ei voitu ladata. Yrita uudelleen.");
    return;
  }

  const values = getValues();
  const result = calculateBreakdown(values);
  const meta = getMeta();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  drawOfferCover(doc, meta);
  drawOfferMainPage(doc, meta, values, result);
  drawProcessPage(doc);
  drawThankYouPage(doc);

  doc.save(createPdfFileName(meta));
}

document.getElementById("calculatorForm").addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

document.getElementById("savePdfBtn").addEventListener("click", () => {
  calculateAndRender();
  generateOfferPdf();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  setDefaultValues();
  clearSummary();
  document.getElementById("calculateBtn").textContent = "Laske tarjous";
  sendEmbedHeight();
});

if (isEmbedded()) {
  document.body.classList.add("embed");
}

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
