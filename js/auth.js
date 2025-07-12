const API_BASE = "/api/auth";
const SESSION_KEY = "diapro_session";
const TOKEN_KEY = "access_token";

function setSession(username, token) {
  sessionStorage.setItem(SESSION_KEY, username);
  sessionStorage.setItem(TOKEN_KEY, token);
}
function getSession() {
  return sessionStorage.getItem(SESSION_KEY);
}
function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const age = document.getElementById("signup-age").value.trim();
    const gender = document.getElementById("signup-gender").value;
    const weight = document.getElementById("signup-weight").value.trim();
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value;
    const message = document.getElementById("signup-message");
    message.textContent = "";
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          full_name: name,
          age: parseInt(age),
          gender,
          weight: parseFloat(weight),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        message.style.color = "#d32f2f";
        message.textContent = err.detail || "Signup failed.";
        return;
      }
      const data = await res.json();
      setSession(username, data.access_token);
      message.style.color = "#388e3c";
      message.textContent = "Signup successful! Redirecting...";
      setTimeout(() => (window.location.href = "dashboard.html"), 1200);
    } catch (err) {
      message.style.color = "#d32f2f";
      message.textContent = "Signup failed. Please try again.";
    }
  });
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");
    message.textContent = "";
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        message.style.color = "#d32f2f";
        message.textContent = err.detail || "Login failed.";
        return;
      }
      const data = await res.json();
      setSession(username, data.access_token);
      message.style.color = "#388e3c";
      message.textContent = "Login successful! Redirecting...";
      setTimeout(() => (window.location.href = "dashboard.html"), 1200);
    } catch (err) {
      message.style.color = "#d32f2f";
      message.textContent = "Login failed. Please try again.";
    }
  });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    clearSession();
    window.location.href = "login.html";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const protectedPages = ["dashboard.html", "medication.html", "profile.html"];
  const currentPage = window.location.pathname.split("/").pop();
  if (protectedPages.includes(currentPage) && !getToken()) {
    window.location.href = "login.html";
  }
  if ((loginForm || signupForm) && getToken()) {
    window.location.href = "dashboard.html";
  }
});
