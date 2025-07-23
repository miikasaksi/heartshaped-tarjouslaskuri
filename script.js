function calculate() {
  const selectedPrice = document.getElementById("type").value;
  const customPrice = parseFloat(document.getElementById("customPrice").value);
  const pricePerPerson = selectedPrice === "custom" ? customPrice : parseFloat(selectedPrice);

  const participants = parseInt(document.getElementById("participants").value);
  const staff = parseInt(document.getElementById("staff").value);
  const staffCost = parseFloat(document.getElementById("staffCost").value);
  const hours = parseFloat(document.getElementById("hours").value);
  const travel = parseFloat(document.getElementById("travel").value);
  const extras = parseFloat(document.getElementById("extras").value);

  const participantTotal = pricePerPerson * participants;
  const staffTotal = staff * staffCost * hours;
  const subtotal = participantTotal + staffTotal + travel + extras;
  const vat = subtotal * 0.255;
  const total = subtotal + vat;

  document.getElementById("result").innerHTML = `
    Hinta ilman ALV: ${subtotal.toFixed(2)} €<br>
    ALV (25,5%): ${vat.toFixed(2)} €<br>
    <strong>Yhteensä: ${total.toFixed(2)} €</strong>
  `;
}
