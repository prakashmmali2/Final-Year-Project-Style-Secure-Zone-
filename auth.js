// ================= AUTH HANDLING =================

// Redirect to login if not logged in (only on Webpages.html)
function checkAuth() {
  const user = localStorage.getItem("user");
  const onProtectedPage = window.location.pathname.includes("Webpages.html");

  if (!user && onProtectedPage) {
    window.location.href = "login.html";
  }
}

// Run auth check only on main page
if (window.location.pathname.includes("Webpages.html")) {
  checkAuth();
}

// Handle signup
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify({ email, password }));

    // Redirect directly to main page
    alert("Sign up successful! Redirecting to main page...");
    window.location.href = "Webpages.html";
  });
}

// Handle login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
      alert("Login successful!");
      window.location.href = "Webpages.html";
    } else {
      alert("Invalid email or password");
    }
  });
}

// Handle logout
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  const user = localStorage.getItem("user");
  if (user) {
    logoutButton.classList.add("show"); // show only if logged in
  }

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}
