// ===================== Global Objects: =====================
const ui = {
  confirm: async (message) => createConfirm(message)
}
// ===========================================================

// -----------------------------------------------------------------------

const createConfirm = (message) => {
  return new Promise((complete, failed)=>{
    $('#confirmMessage').text(message)

    $('#confirmYes').off('click');
    $('#confirmNo').off('click');
    
    $('#confirmYes').on('click', ()=> { $('.confirm').hide(); complete(true); });
    $('#confirmNo').on('click', ()=> { $('.confirm').hide(); complete(false); });
    
    $('.confirm').show();
  });
}

async function setupPage() {
  // Check if user is logged in
  const loggedIn = await isLoggedIn();

  // If the user is not logged in, redirect to the login page
  if (!loggedIn) {
    window.location.href = "login.html";
    return;
  }

  // Get the user's document from the database and fill out page
  const userData = await getUserDocument();
  const userInfo = await getUserInfo();

  // Fill out page with info
  $("#displayName").text(userInfo.name);
  $("#totalCredits").text(userData.credits);
  $("#totalSpent").text(userData.creditsBet);
  $("#totalWon").text(userData.creditsWon);
  $("#email").text(userInfo.email);
  $("#wins").text(userData.wins);
  $("#losses").text(userData.losses);

  var winLossRatio = 0;
  if(userData.losses == 0) {
    winLossRatio = userData.wins;
  }
  else {
    winLossRatio = userData.wins / userData.losses;
  }
  $("#winLossRatio").text(Number(winLossRatio).toFixed(2));
}

async function resetAccountStats()
{
  // === Reset user's account stats to 0: ===

  // Get all the current statistics in the account:
  var currentAccountCredits = await getCredits();
  var currentAccountSpentCredits = await getCreditsBet();
  var currentAccountWonCredits = await getCreditsWon();
  var currentAccountWins = await getWins();
  var currentAccountLosses = await getLosses();

  // Remove all the current figures from their db stores:
  await removeCredits(currentAccountCredits);
  await removeCreditsBet(currentAccountSpentCredits);
  await removeCreditsWon(currentAccountWonCredits);
  await removeWins(currentAccountWins);
  await removeLosses(currentAccountLosses);

  setupPage();
}

const confirmReset = async () => {
  const confirm = await ui.confirm('ALERT: You are about to wipe your account\'s credits and statistics. Are you sure you want to proceed?');
  
  if(confirm)
  {
    await resetAccountStats();
  } 
}

// Call setupPage() when the page loads
setupPage();
