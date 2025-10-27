import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import * as serviceWorker from "./serviceWorker";
import { AuthProvider } from "./app/auth/AuthContext";
import { NotificationsProvider } from "./app/context/NotificationsContext";
// import OneSignal from "react-onesignal";

const root = ReactDOM.createRoot(document.getElementById("root"));

const maxInactivityDuration = 2 * 60 * 60 * 1000; // 2 hours

let inactivityTimer;

// Function to start the inactivity timer
function startInactivityTimer() {
  inactivityTimer = setTimeout(() => {
    // Clear local storage and log out the user
    localStorage.clear();
    // Redirect to the login page or perform any necessary logout actions
    window.location = "/login";
  }, maxInactivityDuration);
}

// Function to reset the inactivity timer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  startInactivityTimer();
}

// Attach event listeners to relevant user activity events
function attachActivityListeners() {
  document.addEventListener("click", resetInactivityTimer);
  document.addEventListener("keydown", resetInactivityTimer);
  // Add more event listeners for other relevant activity events
}

// Start the inactivity timer on application load, except on the login page
if (window.location.pathname !== "/login") {
  startInactivityTimer();
  attachActivityListeners();
}

root.render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </AuthProvider>
  </BrowserRouter>
);

serviceWorker.unregister();
