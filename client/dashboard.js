// Server URL configuration

const SERVER_URL = CONFIG.apiUrl;

// Check if user is logged in
async function checkLogin() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Check if user just signed up successfully
  if (localStorage.getItem("signupSuccess") === "true") {
    alert("Account created successfully! Welcome to CampusEvents.");
    localStorage.removeItem("signupSuccess"); // Remove flag after showing
  }

  // Display user greeting
  document.getElementById(
    "userGreeting"
  ).textContent = `Hello, ${user.fullName}!`;

  // Set profile initial
  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : "U";
  document.getElementById("profileInitial").textContent = initial;

  // Fetch current user role from server and show Create Event button if admin/organizer
  try {
    const response = await fetch(
      `${SERVER_URL}/api/user/${encodeURIComponent(user.email)}`
    );
    const data = await response.json();

    if (data.success) {
      const serverUser = data.user;
      // Update localStorage with fresh data
      localStorage.setItem("loggedInUser", JSON.stringify(serverUser));

      // Show Create Event button for admin/organizer
      if (serverUser.role === "admin" || serverUser.role === "organizer") {
        document.getElementById("createEventBtn").classList.remove("hidden");
      }
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
}

// Open Create Event modal
function openCreateEvent() {
  const modal = document.getElementById("createEventModal");
  modal.classList.remove("hidden");
}

// Close Create Event modal
function closeCreateEventModal() {
  const modal = document.getElementById("createEventModal");
  modal.classList.add("hidden");
  document.getElementById("createEventForm").reset();
}

// Handle Create Event form submission
async function handleCreateEvent(e) {
  e.preventDefault();

  const form = e.target;
  const eventData = {
    title: form.title.value,
    date: form.date.value,
    time: form.time.value,
    location: form.location.value,
    description: form.description.value,
    status: form.status.value,
    attendees: 0,
  };

  try {
    const response = await fetch(`${SERVER_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (data.success) {
      alert("Event created successfully!");
      closeCreateEventModal();
      loadEvents(); // Refresh the events list
    } else {
      alert(data.message || "Error creating event");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error creating event. Please make sure the server is running.");
  }
}

// Toggle profile dropdown
function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("hidden");
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("profileDropdown");
  const profileBtn = document.getElementById("profileBtn");
  if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

// Open profile page/modal
function openProfile() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.add("hidden");
  alert("Profile page coming soon!");
}

// Request admin access
async function requestAdminAccess() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.add("hidden");

  const localUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!localUser || !localUser.email) {
    alert("Please log in again.");
    window.location.href = "index.html";
    return;
  }

  try {
    // Fetch current user data from server
    const response = await fetch(
      `${SERVER_URL}/api/user/${encodeURIComponent(localUser.email)}`
    );
    const data = await response.json();

    if (data.success) {
      const user = data.user;
      // Update localStorage with fresh data
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      if (user.role === "admin" || user.role === "organizer") {
        alert("You are already an Admin");
      } else {
        alert(
          "Admin access request submitted! An administrator will review your request."
        );
      }
    } else {
      alert("Error fetching user data. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert(
      "Error connecting to server. Please make sure the server is running."
    );
  }
}

// Events data - will be loaded from server
let eventsData = [];
let registeredEventsData = [];
let registeredEventIds = new Set();
let currentView = "all";

function getEventId(event) {
  return event._id || event.id || "";
}

function renderEventCard(event, { isRegistered, isAdminOrOrganizer, isAdmin }) {
  const eventId = getEventId(event);
  let button = "";

  if (isAdmin) {
    button = `<button
        class="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
        data-delete-id="${eventId}"
        onclick="deleteEvent('${eventId}')"
      >
        Delete Event
      </button>`;
  } else if (!isAdminOrOrganizer) {
    button = isRegistered
      ? `<button
          class="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium cursor-not-allowed"
          disabled
        >
          Registered
        </button>`
      : `<button
          class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          data-event-id="${eventId}"
          onclick="registerForEvent('${eventId}')"
        >
          Register Now
        </button>`;
  }

  return `
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
          <p>👥 ${event.attendees || 0} registered</p>
        </div>
        <p class="text-gray-700 mb-4">${event.description}</p>
        <div class="flex gap-2">
          <span class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">${
            event.status
          }</span>
        </div>
        ${button}
      </div>
    </div>
  `;
}

function setView(view) {
  currentView = view;
  const registeredSection = document.getElementById("registeredSection");
  const allSection = document.getElementById("allEventsSection");
  const allToggle = document.getElementById("allEventsToggle");
  const regToggle = document.getElementById("registeredToggle");

  const activeClasses = "bg-blue-600 text-white shadow hover:bg-blue-700";
  const inactiveClasses =
    "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50";

  if (view === "registered") {
    registeredSection.classList.remove("hidden");
    allSection.classList.add("hidden");
    regToggle.className = `px-4 py-2 rounded-full font-semibold transition ${activeClasses}`;
    allToggle.className = `px-4 py-2 rounded-full font-semibold transition ${inactiveClasses}`;
  } else {
    allSection.classList.remove("hidden");
    registeredSection.classList.add("hidden");
    allToggle.className = `px-4 py-2 rounded-full font-semibold transition ${activeClasses}`;
    regToggle.className = `px-4 py-2 rounded-full font-semibold transition ${inactiveClasses}`;
  }
}

// Load and display events with registered states
async function loadEvents() {
  const container = document.getElementById("eventsContainer");
  const registeredContainer = document.getElementById(
    "registeredEventsContainer"
  );
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdminOrOrganizer =
    user && (user.role === "admin" || user.role === "organizer");
  const isAdmin = user && user.role === "admin";

  try {
    const response = await fetch(`${SERVER_URL}/api/events`);
    const data = await response.json();
    if (data.success) {
      eventsData = data.events;
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    container.innerHTML =
      '<p class="text-red-500">Error loading events. Please make sure the server is running.</p>';
    return;
  }

  // Fetch registered events for current user
  registeredEventIds = new Set();
  registeredEventsData = [];
  if (user?.email) {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/events/registered?email=${encodeURIComponent(
          user.email
        )}`
      );
      const data = await response.json();
      if (data.success) {
        registeredEventsData = data.events || [];
        registeredEventsData.forEach((event) =>
          registeredEventIds.add(getEventId(event))
        );
      }
    } catch (error) {
      console.error("Error fetching registered events:", error);
    }
  }

  const registeredCards = registeredEventsData.length
    ? registeredEventsData
        .map((event) =>
          renderEventCard(event, {
            isRegistered: true,
            isAdminOrOrganizer,
            isAdmin,
          })
        )
        .join("")
    : '<p class="text-gray-500">You haven\'t registered for any events yet.</p>';

  registeredContainer.innerHTML = registeredCards;

  const allCards = eventsData
    .map((event) =>
      renderEventCard(event, {
        isRegistered: registeredEventIds.has(getEventId(event)),
        isAdminOrOrganizer,
        isAdmin,
      })
    )
    .join("");

  container.innerHTML =
    allCards || '<p class="text-gray-500">No events available yet.</p>';
}

async function registerForEvent(eventId) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) {
    alert("Please log in again.");
    window.location.href = "index.html";
    return;
  }

  // Show confirmation dialog
  const confirmed = confirm(
    "Are you sure you want to register for this event?"
  );
  if (!confirmed) {
    return;
  }

  const button = document.querySelector(`button[data-event-id="${eventId}"]`);
  if (button) {
    button.disabled = true;
    button.textContent = "Registering...";
    button.classList.add("opacity-70");
  }

  try {
    const response = await fetch(
      `${SERVER_URL}/api/events/${eventId}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      }
    );

    const data = await response.json();

    if (data.success) {
      registeredEventIds.add(eventId);
      await loadEvents();
    } else {
      alert(data.message || "Error registering for event");
    }
  } catch (error) {
    console.error("Error registering for event:", error);
    alert("Error registering for event. Please try again.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = registeredEventIds.has(eventId)
        ? "Registered"
        : "Register Now";
      button.classList.remove("opacity-70");
    }
  }
}

async function deleteEvent(eventId) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email || user.role !== "admin") {
    alert("Only admins can delete events.");
    return;
  }

  const button = document.querySelector(`button[data-delete-id="${eventId}"]`);
  if (button) {
    button.disabled = true;
    button.textContent = "Deleting...";
    button.classList.add("opacity-70");
  }

  try {
    const response = await fetch(`${SERVER_URL}/api/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: user.email }),
    });

    const data = await response.json();
    if (data.success) {
      await loadEvents();
    } else {
      alert(data.message || "Error deleting event");
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    alert("Error deleting event. Please try again.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Delete Event";
      button.classList.remove("opacity-70");
    }
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  checkLogin();
  setView("all");
  loadEvents();
});
