const API_BASE = "/api/medications";
const TOKEN_KEY = "access_token";

let medications = [];
let editingId = null;
let isEditMode = false;

const medList = document.getElementById("medication-list");
const addMedForm = document.getElementById("add-medication-form");
const medName = document.getElementById("med-name");
const medType = document.getElementById("med-type");
const medSchedule = document.getElementById("med-schedule");

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function renderMedications() {
  if (medList) {
    medList.innerHTML = "";
    medications.forEach((med) => {
      const li = document.createElement("li");
      li.className = "medication-item mb-3 p-3 border rounded";

      const info = document.createElement("div");
      info.className = "med-info mb-2";
      info.innerHTML = `
                <h5 class="mb-1">${med.name}</h5>
                <p class="mb-1 text-muted"><strong>Type:</strong> ${med.medication_type}</p>
                <p class="mb-0 text-muted"><strong>Schedule:</strong> ${med.schedule}</p>
            `;

      const actions = document.createElement("div");
      actions.className = "med-actions d-flex gap-2";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-outline-primary btn-sm";
      editBtn.innerHTML = '<i class="bi bi-pencil"></i> Edit';
      editBtn.onclick = () => editMedication(med);

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-outline-danger btn-sm";
      delBtn.innerHTML = '<i class="bi bi-trash"></i> Delete';
      delBtn.onclick = () => deleteMedication(med.id);

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      li.appendChild(info);
      li.appendChild(actions);
      medList.appendChild(li);
    });
  }
}

async function fetchMedications() {
  try {
    const res = await fetch(API_BASE + "/", {
      headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) throw new Error("Failed to fetch medications");
    medications = await res.json();
    renderMedications();
  } catch (err) {
    showMessage("Could not load medications.", "danger");
  }
}

addMedForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = medName.value.trim();
  const type = medType.value.trim();
  const schedule = medSchedule.value.trim();
  if (!name || !type || !schedule) {
    showMessage("Please fill in all fields", "danger");
    return;
  }
  try {
    if (isEditMode && editingId) {
      
      const res = await fetch(`${API_BASE}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          name: name,
          medication_type: type,
          schedule: schedule,
        }),
      });
      if (!res.ok) throw new Error("Failed to update medication");
      showMessage("Medication updated successfully!", "success");
    } else {
      
      const res = await fetch(API_BASE + "/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          name: name,
          medication_type: type,
          schedule: schedule,
        }),
      });
      if (!res.ok) throw new Error("Failed to add medication");
      showMessage("Medication saved successfully!", "success");
    }
    medName.value = "";
    medType.value = "";
    medSchedule.value = "";
    isEditMode = false;
    editingId = null;
    const submitBtn = addMedForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = "Add Medication";
    submitBtn.className = "btn btn-pink fw-bold";
    await fetchMedications();
    triggerReminderUpdate();
  } catch (err) {
    showMessage("Could not save medication.", "danger");
  }
});

function editMedication(med) {
  medName.value = med.name;
  medType.value = med.medication_type;
  medSchedule.value = med.schedule;
  isEditMode = true;
  editingId = med.id;
  const submitBtn = addMedForm.querySelector('button[type="submit"]');
  submitBtn.innerHTML = "Update Medication";
  submitBtn.className = "btn btn-warning fw-bold";
  medName.focus();
  addMedForm.scrollIntoView({ behavior: "smooth" });
}

async function deleteMedication(id) {
  if (confirm("Are you sure you want to delete this medication?")) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + getToken() },
      });
      if (!res.ok) throw new Error("Failed to delete medication");
      showMessage("Medication deleted successfully!", "success");
      await fetchMedications();
      triggerReminderUpdate();
      if (isEditMode && editingId === id) {
        clearEditMode();
      }
    } catch (err) {
      showMessage("Could not delete medication.", "danger");
    }
  }
}

function clearEditMode() {
  isEditMode = false;
  editingId = null;
  medName.value = "";
  medType.value = "";
  medSchedule.value = "";
  const submitBtn = addMedForm.querySelector('button[type="submit"]');
  submitBtn.innerHTML = "Add Medication";
  submitBtn.className = "btn btn-pink fw-bold";
}

function triggerReminderUpdate() {
  const event = new CustomEvent("medicationsUpdated", {
    detail: { medications: medications },
  });
  window.dispatchEvent(event);
}

function showMessage(message, type = "info") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `alert alert-${
    type === "success" ? "success" : type === "danger" ? "danger" : "info"
  } alert-dismissible fade show`;
  messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  const main = document.querySelector("main");
  main.insertBefore(messageDiv, main.firstChild);
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
  fetchMedications();
  triggerReminderUpdate();

  
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem("diapro_session");
      window.location.href = "login.html";
    });
  }
});
