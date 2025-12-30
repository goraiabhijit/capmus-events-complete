// Server URL configuration
const SERVER_URL = CONFIG.apiUrl;

// Events data - will be loaded from server
let eventsData = [];

// Fetch events from server
async function fetchEvents() {
  try {
    const response = await fetch(`${SERVER_URL}/api/events`);
    const data = await response.json();
    if (data.success) {
      eventsData = data.events;
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

// Initialize events on page load
fetchEvents();

let currentPage = "home";

function navigateTo(page) {
  currentPage = page;
  const app = document.getElementById("app");

  if (page === "signup") {
    openSignupModal();
  } else if (page === "login") {
    openLoginModal();
  } else if (page === "events") {
    showEventsPage(app);
  } else if (page === "home") {
    location.reload();
  } else {
    alert(`Navigating to ${page}...`);
  }
}

function openSignupModal() {
  const modal = document.getElementById("signupModal");
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeSignupModal() {
  const modal = document.getElementById("signupModal");
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const eyeIcon = document.getElementById(inputId + "Eye");

  if (input.type === "password") {
    input.type = "text";
    eyeIcon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
    `;
  } else {
    input.type = "password";
    eyeIcon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    `;
  }
}

async function handleSignup(e) {
  e.preventDefault();

  const fullName = e.target.querySelector('input[type="text"]').value;
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;
  const confirmPassword = e.target.querySelectorAll('input[type="password"]')[1]
    .value;

  // Validation
  if (!fullName || !email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    // Send signup data to server
    const response = await fetch(`${SERVER_URL}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: fullName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store user data and success message in localStorage
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      localStorage.setItem("signupSuccess", "true");
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert(
      "Error creating account. Make sure the server is running: node server.js"
    );
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  // Validation
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    // Send login data to server
    const response = await fetch(`${SERVER_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store user data in localStorage
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      // alert("Login successful!");
      e.target.reset();
      closeLoginModal();
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error logging in. Make sure the server is running: node server.js");
  }
}

function showEventsPage(app) {
  const userData = localStorage.getItem("loggedInUser");
  const isLoggedIn =
    userData !== null && userData !== "null" && userData !== "";

  const buttonClass = isLoggedIn
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-gray-500 hover:bg-gray-600";
  const buttonText = isLoggedIn ? "Register Now" : "Login to Register";
  const buttonAction = isLoggedIn ? "" : "navigateTo('login')";

  app.innerHTML = `
                <section class="pt-20 pb-20">
                    <div class="max-w-6xl mx-auto px-6">
                        <div class="mb-12">
                            <button onclick="navigateTo('home')" class="mb-6 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                                ← Back to Home
                            </button>
                            <h1 class="text-4xl font-bold mb-4">Upcoming Campus Events</h1>
                            <p class="text-xl text-gray-600">Discover and register for exciting events happening on campus</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${eventsData
                              .map(
                                (event) => `
                                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center text-white text-4xl">
                                        🎫
                                    </div>
                                    <div class="p-6">
                                        <h3 class="text-xl font-bold mb-2">${event.title}</h3>
                                        <div class="space-y-3 text-sm text-gray-600 mb-4">
                                            <p>📅 ${event.date}</p>
                                            <p>⏰ ${event.time}</p>
                                            <p>📍 ${event.location}</p>
                                            <p>👥 ${event.attendees} registered</p>
                                        </div>
                                        <p class="text-gray-700 mb-4">${event.description}</p>
                                        <div class="flex gap-2">
                                            <span class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">${event.status}</span>
                                        </div>
                                        <button onclick="${buttonAction}" class="mt-4 w-full px-4 py-2 ${buttonClass} text-white rounded-lg font-medium transition">
                                            ${buttonText}
                                        </button>
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                </section>
            `;
}
