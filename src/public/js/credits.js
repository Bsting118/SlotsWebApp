// -----------------------------------------------------------------------

async function purchaseCredits(numCredits) {
  // Show loading container
  document.getElementById("loading").style.display = "flex";

  // Call the API
  await addCredits(numCredits);

  const newCredits = await getCredits();

  document.getElementById("credits").innerText = newCredits;

  // Hide loading container
  document.getElementById("loading").style.display = "none";
}

async function setupPage() {
  const credits = await getCredits();
  document.getElementById("credits").innerText = credits;
}

setupPage();