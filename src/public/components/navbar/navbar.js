// Begin to fetch navbar.html
const navbarHtmlPromise = fetch("components/navbar/navbar.html");

firebase.auth().onAuthStateChanged(async (user) => {
  // Wait for html promise to resolve
  const html = await navbarHtmlPromise;

  // Wait for buffer to be read
  const text = await html.text();

  // Create a jQuery object from the html and add the name to the navbar
  const element = $(text);

  // Check if user is logged in
  if (user) {
    // Add the name to the navbar
    element.find("#name").html(user.displayName);
  } else if (document.location.pathname.includes("about")) {
    // Remove Welcome and replace "Logout" with "Login"
    element.find("#nav-user").remove();
    element.find("#nav-logout").html("Login").attr("href", "/login.html");
  } else {
    // Redirect to login page
    window.location.replace("/login.html");
  }

  // Remove the .active class form elements
  element.find(".active").removeClass("active");

  // Add the .active class to the current page
  switch (document.location.pathname) {
    case "/home.html":
    case "/home":
      // Add the .active class and remove the href from the link
      element.find("#nav-home").addClass("active").removeAttr("href");
      break;
    case "/credits.html":
    case "/credits":
      // Add the .active class and remove the href from the link
      element.find("#nav-credits").addClass("active").removeAttr("href");
      break;
    case "/about.html":
    case "/about":
      // Add the .active class and remove the href from the link
      element.find("#nav-about").addClass("active").removeAttr("href");
      break;
    case "/user.html":
    case "/user":
      // Add the .active class and remove the href from the link
      element.find("#nav-user").addClass("active").removeAttr("href");
      break;
  }

  // Add the navbar to the page
  $("#navbar-template").replaceWith(element);
  // } else {
  //   // Redirect to login page
  //   window.location.replace("/login.html");
  // }
});
