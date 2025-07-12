const API_BASE = "/api/users";
const TOKEN_KEY = "access_token";

const profileForm = document.getElementById("profile-form");
const profileName = document.getElementById("profile-name");
const profileAge = document.getElementById("profile-age");
const profileGender = document.getElementById("profile-gender");
const profileWeight = document.getElementById("profile-weight");
const profileMessage = document.getElementById("profile-message");

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}


async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    const user = await res.json();

    if (user.full_name) profileName.value = user.full_name;
    if (user.age) profileAge.value = user.age;
    if (user.gender) profileGender.value = user.gender;
    if (user.weight) profileWeight.value = user.weight;
  } catch (err) {
    showMessage("Could not load profile data.", "error");
  }
}


profileForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  try {
    const res = await fetch(`${API_BASE}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({
        full_name: profileName.value,
        age: parseInt(profileAge.value) || null,
        gender: profileGender.value,
        weight: parseFloat(profileWeight.value) || null,
      }),
    });

    if (!res.ok) throw new Error("Failed to update profile");

    profileMessage.textContent = "Profile saved successfully!";
    profileMessage.style.color = "#28a745";
    setTimeout(() => (profileMessage.textContent = ""), 3000);
  } catch (err) {
    profileMessage.textContent = "Could not save profile. Please try again.";
    profileMessage.style.color = "#d32f2f";
    setTimeout(() => (profileMessage.textContent = ""), 3000);
  }
});


function showMessage(message, type = "info") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `alert alert-${
    type === "success" ? "success" : type === "error" ? "danger" : "info"
  } alert-dismissible fade show`;
  messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  profileForm.parentNode.insertBefore(messageDiv, profileForm.nextSibling);
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 3000);
}


document.addEventListener("DOMContentLoaded", function () {
  if (!getToken()) {
    window.location.href = "login.html";
    return;
  }
  loadProfile();

  
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem("diapro_session");
      window.location.href = "login.html";
    });
  }
});
