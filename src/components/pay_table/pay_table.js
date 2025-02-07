// ===================== Global constants: =====================
// Fetch the pay table data from the server and render it to the page
const payTableHtmlPromise = fetch("/src/components/pay_table/pay_table.html");
// =============================================================

// -----------------------------------------------------------------------

function permutateOdds(inputOdds, numOfOccurences) {
  var result = Math.pow(inputOdds, numOfOccurences);
  return result;
}

function roundToPrecision(value, decimalCount) {
  const pow = Math.pow(10, decimalCount);
  return Math.round((value + Number.EPSILON) * pow) / pow;
}

function insertDefaultOddsToPayTable() {
  let numOfReelsForPayTable = getNumOfActiveReels(); // Access from slots interface/home.html

  const cherryDecimalOdds = roundToPrecision(
    permutateOdds(DEFAULT_ODDS_CHERRY, 1),
    4
  );
  const cherriesDecimalOdds = roundToPrecision(
    permutateOdds(DEFAULT_ODDS_CHERRY, numOfReelsForPayTable),
    4
  );
  const barsDecimalOdds = roundToPrecision(
    permutateOdds(DEFAULT_ODDS_BAR, numOfReelsForPayTable),
    4
  );
  const chipsDecimalOdds = roundToPrecision(
    permutateOdds(DEFAULT_ODDS_CHIPS, numOfReelsForPayTable),
    4
  );
  const gemsDecimalOdds = roundToPrecision(
    permutateOdds(DEFAULT_ODDS_GEM, numOfReelsForPayTable),
    4
  );
  const sevensDecimalOdds = roundToPrecision(
    permutateOdds(DEFAULT_ODDS_7, numOfReelsForPayTable),
    4
  );

  // Formatting odds into permutated rounded percentages (out of 100):
  document.getElementById("cherry_set_odds").innerText = roundToPrecision(
    cherryDecimalOdds * 100,
    4
  );
  document.getElementById("cherries_set_odds").innerText = roundToPrecision(
    cherriesDecimalOdds * 100,
    4
  );
  document.getElementById("bars_set_odds").innerText = roundToPrecision(
    barsDecimalOdds * 100,
    4
  );
  document.getElementById("chips_set_odds").innerText = roundToPrecision(
    chipsDecimalOdds * 100,
    4
  );
  document.getElementById("gems_set_odds").innerText = roundToPrecision(
    gemsDecimalOdds * 100,
    4
  );
  document.getElementById("seven_set_odds").innerText = roundToPrecision(
    sevensDecimalOdds * 100,
    4
  );
}

function insertDefaultPaysToPayTable() {
  document.getElementById("cherry_value").innerText = DEFAULT_PAYS_WILDCARD;
  document.getElementById("cherry_set_value").innerText = DEFAULT_PAYS_CHERRY;
  document.getElementById("bar_set_value").innerText = DEFAULT_PAYS_BAR;
  document.getElementById("chips_set_value").innerText = DEFAULT_PAYS_CHIPS;
  document.getElementById("gem_set_value").innerText = DEFAULT_PAYS_GEM;
  document.getElementById("seven_set_value").innerText = DEFAULT_PAYS_7;
}

$(document).ready(async () => {
  // Wait for html promise to resolve
  const html = await payTableHtmlPromise;

  // Wait for buffer to be read
  const text = await html.text();

  // Find target
  const target = $("#pay-table");

  console.log(target, text);

  // Set inner html
  target.html(text);

  // Set the pay table's default values upon initial load:
  insertDefaultOddsToPayTable();
  insertDefaultPaysToPayTable();
});
