const API_BASE = "/api/caregiver";
const TOKEN_KEY = "access_token";

document.addEventListener("DOMContentLoaded", function () {
  const caregiverCode = sessionStorage.getItem("caregiverCode");
  const caregiverPatientId = sessionStorage.getItem("caregiverPatientId");

  if (!caregiverCode || !caregiverPatientId) {
    window.location.href = "caregiver-login.html";
    return;
  }

  const navLinks = document.querySelectorAll(".nav-link[data-section]");
  const contentSections = document.querySelectorAll(".content-section");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetSection = this.getAttribute("data-section");
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
      contentSections.forEach((section) => {
        section.style.display = "none";
      });
      document.getElementById(targetSection + "-section").style.display =
        "block";
      if (targetSection === "dashboard") loadDashboardData();
      if (targetSection === "medications") loadMedicationsData();
      if (targetSection === "profile") loadProfileData();
      if (targetSection === "glucose") loadGlucoseData();
      if (targetSection === "refills") loadRefillsData();
      if (targetSection === "notes") loadNotesData();
    });
  });

  const patientName = sessionStorage.getItem("caregiverUserName") || "Patient";
  document.getElementById("patient-name").textContent = patientName;
  document.getElementById("patient-name-display").textContent = patientName;

  loadDashboardData();
  loadMedicationsData();
  loadProfileData();
  loadGlucoseData();
  loadRefillsData();
  loadNotesData();

  function getCaregiverToken() {
    return caregiverCode;
  }

  async function loadDashboardData() {
    try {
      const medResponse = await fetch("/api/caregiver/patient/medications", {
        headers: { Authorization: `Bearer ${getCaregiverToken()}` },
      });
      const medications = medResponse.ok ? await medResponse.json() : [];

      const medSummary = document.getElementById("medications-summary");
      if (medications.length > 0) {
        let html = '<ul class="list-unstyled">';
        medications.slice(0, 3).forEach((med) => {
          html += `<li><i class="bi bi-capsule text-pink"></i> ${med.name} (${med.medication_type})</li>`;
        });
        if (medications.length > 3) {
          html += `<li class="text-muted">... and ${
            medications.length - 3
          } more</li>`;
        }
        html += "</ul>";
        medSummary.innerHTML = html;
      } else {
        medSummary.innerHTML =
          '<p class="text-muted">No medications available</p>';
      }

      const calendarResponse = await fetch("/api/caregiver/patient/calendar", {
        headers: { Authorization: `Bearer ${getCaregiverToken()}` },
      });
      const calendarEvents = calendarResponse.ok
        ? await calendarResponse.json()
        : [];

      const calendarSummary = document.getElementById("calendar-summary");
      if (calendarEvents.length > 0) {
        let html = '<ul class="list-unstyled">';
        const today = new Date();
        calendarEvents.slice(0, 5).forEach((event) => {
          const eventDate = new Date(event.event_date);
          const daysDiff = Math.ceil(
            (eventDate - today) / (1000 * 60 * 60 * 24)
          );
          let dateText = "";
          if (daysDiff === 0) {
            dateText = '<span class="badge bg-danger">TODAY</span>';
          } else if (daysDiff === 1) {
            dateText = '<span class="badge bg-warning">TOMORROW</span>';
          } else if (daysDiff > 0 && daysDiff <= 7) {
            dateText = `<span class="badge bg-info">In ${daysDiff} day${
              daysDiff > 1 ? "s" : ""
            }</span>`;
          } else {
            dateText = `<span class="badge bg-secondary">${eventDate.toLocaleDateString()}</span>`;
          }
          html += `<li class="mb-2"><i class="bi bi-calendar-event text-info"></i> ${dateText} ${event.title}</li>`;
        });
        if (calendarEvents.length > 5) {
          html += `<li class="text-muted">... and ${
            calendarEvents.length - 5
          } more appointments</li>`;
        }
        html += "</ul>";
        calendarSummary.innerHTML = html;
      } else {
        calendarSummary.innerHTML =
          '<p class="text-muted">No appointments available</p>';
      }

      loadGlucoseChart("glucose-chart");
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }

  async function loadMedicationsData() {
    try {
      const response = await fetch("/api/caregiver/patient/medications", {
        headers: { Authorization: `Bearer ${getCaregiverToken()}` },
      });
      const medications = response.ok ? await response.json() : [];

      const medList = document.getElementById("medications-list");
      if (medications.length > 0) {
        let html = '<div class="table-responsive"><table class="table">';
        html +=
          "<thead><tr><th>Medication</th><th>Type</th><th>Schedule</th></tr></thead><tbody>";
        medications.forEach((med) => {
          html += `<tr><td>${med.name}</td><td>${med.medication_type}</td><td>${med.schedule}</td></tr>`;
        });
        html += "</tbody></table></div>";
        medList.innerHTML = html;
      } else {
        medList.innerHTML =
          '<p class="text-muted">No medications available</p>';
      }
    } catch (error) {
      console.error("Error loading medications:", error);
    }
  }

  async function loadProfileData() {
    try {
      const response = await fetch("/api/caregiver/patient/profile", {
        headers: { Authorization: `Bearer ${getCaregiverToken()}` },
      });
      const userData = response.ok ? await response.json() : {};

      const profileInfo = document.getElementById("profile-info");
      if (
        userData.full_name ||
        userData.age ||
        userData.gender ||
        userData.weight
      ) {
        let html = '<div class="row">';
        html += '<div class="col-md-6"><h4>Personal Information</h4>';
        html += `<p><strong>Name:</strong> ${
          userData.full_name || "Not specified"
        }</p>`;
        html += `<p><strong>Age:</strong> ${
          userData.age || "Not specified"
        }</p>`;
        html += `<p><strong>Gender:</strong> ${
          userData.gender || "Not specified"
        }</p>`;
        html += `<p><strong>Weight:</strong> ${
          userData.weight || "Not specified"
        } kg</p>`;
        html += "</div>";
        html += '<div class="col-md-6"><h4>Account Information</h4>';
        html += `<p><strong>Account Type:</strong> Patient</p>`;
        html += `<p><strong>Caregiver Access:</strong> Enabled</p>`;
        html += "</div></div>";
        profileInfo.innerHTML = html;
      } else {
        profileInfo.innerHTML =
          '<p class="text-muted">No profile information available</p>';
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  async function loadGlucoseData() {
    try {
      const response = await fetch("/api/caregiver/patient/glucose", {
        headers: { Authorization: `Bearer ${getCaregiverToken()}` },
      });
      const glucoseData = response.ok ? await response.json() : [];

      loadGlucoseChart("detailed-glucose-chart");
      const glucoseStats = document.getElementById("glucose-stats");
      if (glucoseData.length > 0) {
        const values = glucoseData.map((reading) => reading.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        let html = '<div class="row">';
        html += `<div class="col-md-3"><div class="text-center"><h4>${avg.toFixed(
          0
        )}</h4><small class="text-muted">Average</small></div></div>`;
        html += `<div class="col-md-3"><div class="text-center"><h4>${min}</h4><small class="text-muted">Lowest</small></div></div>`;
        html += `<div class="col-md-3"><div class="text-center"><h4>${max}</h4><small class="text-muted">Highest</small></div></div>`;
        html += `<div class="col-md-3"><div class="text-center"><h4>${values.length}</h4><small class="text-muted">Readings</small></div></div>`;
        html += "</div>";
        glucoseStats.innerHTML = html;
      } else {
        glucoseStats.innerHTML =
          '<p class="text-muted">No glucose data available</p>';
      }
    } catch (error) {
      console.error("Error loading glucose data:", error);
    }
  }

  async function loadRefillsData() {
    try {
      const response = await fetch("/api/caregiver/patient/pharmacy", {
        headers: { Authorization: `Bearer ${getCaregiverToken()}` },
      });
      const refillRequestsData = response.ok ? await response.json() : [];

      const refillRequests = document.getElementById("refill-requests");
      if (refillRequestsData.length > 0) {
        let html = '<div class="list-group">';
        refillRequestsData.forEach((order) => {
          const statusClass =
            order.status === "received" ? "completed" : "pending";
          const statusText =
            order.status === "received" ? "Received" : "Pending";
          const statusIcon =
            order.status === "received"
              ? "bi-check-circle text-success"
              : "bi-clock text-warning";
          html += `<div class="refill-request-item ${statusClass}">`;
          html += `<div class="d-flex justify-content-between align-items-start">`;
          html += `<div class="flex-grow-1">`;
          html += `<h6 class="mb-1">${order.medication_name}</h6>`;
          html += `<p class="mb-1">Quantity: ${order.quantity}</p>`;
          html += `<small class="text-muted">Requested: ${new Date(
            order.created_at
          ).toLocaleDateString()}</small>`;
          html += `</div>`;
          html += `<div class="text-end">`;
          html += `<i class="bi ${statusIcon}"></i> ${statusText}`;
          html += `</div>`;
          html += `</div></div>`;
        });
        html += "</div>";
        refillRequests.innerHTML = html;
      } else {
        refillRequests.innerHTML =
          '<p class="text-muted">No refill requests found</p>';
      }
    } catch (error) {
      console.error("Error loading refills data:", error);
    }
  }

  function loadNotesData() {
    const notesText = document.getElementById("caregiver-notes-text");
    const notesHistory = document.getElementById("notes-history");
    const saveNotesBtn = document.getElementById("save-notes-btn");
    const notesStatus = document.getElementById("notes-status");

    async function fetchNotes() {
      try {
        const response = await fetch(`${API_BASE}/notes/caregiver`, {
          headers: {
            Authorization: `Bearer ${getCaregiverToken()}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const notes = await response.json();
          renderNotes(notes);
        } else {
          console.error("Failed to fetch notes");
          notesHistory.innerHTML =
            '<p class="text-muted">Could not load notes</p>';
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        notesHistory.innerHTML =
          '<p class="text-muted">Error loading notes</p>';
      }
    }

    function renderNotes(notes) {
      if (notes.length > 0) {
        let html = '<div class="list-group">';
        notes.forEach((note, index) => {
          html += `<div class="list-group-item">`;
          html += `<div class="d-flex justify-content-between align-items-start">`;
          html += `<div class="flex-grow-1">${note.note}</div>`;
          html += `<div class="d-flex align-items-center gap-2">`;
          html += `<small class="text-muted">${new Date(
            note.created_at
          ).toLocaleString()}</small>`;
          html += `<button class="btn btn-sm btn-outline-danger delete-note-btn" data-id="${note.id}" title="Delete note">`;
          html += `<i class="bi bi-trash"></i>`;
          html += `</button>`;
          html += `</div>`;
          html += `</div></div>`;
        });
        html += "</div>";
        notesHistory.innerHTML = html;

        const deleteButtons = notesHistory.querySelectorAll(".delete-note-btn");
        deleteButtons.forEach((btn) => {
          btn.addEventListener("click", async function () {
            const noteId = this.getAttribute("data-id");
            if (confirm("Are you sure you want to delete this note?")) {
              try {
                const response = await fetch(`${API_BASE}/notes/${noteId}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${getCaregiverToken()}`,
                    "Content-Type": "application/json",
                  },
                });

                if (response.ok) {
                  notesStatus.innerHTML =
                    '<div class="alert alert-success">Note deleted successfully!</div>';
                  setTimeout(() => {
                    notesStatus.innerHTML = "";
                  }, 3000);
                  fetchNotes();
                } else {
                  const errorData = await response.json();
                  notesStatus.innerHTML = `<div class="alert alert-danger">Failed to delete note: ${
                    errorData.detail || "Unknown error"
                  }</div>`;
                  setTimeout(() => {
                    notesStatus.innerHTML = "";
                  }, 3000);
                }
              } catch (error) {
                console.error("Error deleting note:", error);
                notesStatus.innerHTML =
                  '<div class="alert alert-danger">Error deleting note</div>';
                setTimeout(() => {
                  notesStatus.innerHTML = "";
                }, 3000);
              }
            }
          });
        });
      } else {
        notesHistory.innerHTML = '<p class="text-muted">No previous notes</p>';
      }
    }

    if (
      saveNotesBtn &&
      !saveNotesBtn.hasAttribute("data-save-listener-added")
    ) {
      saveNotesBtn.addEventListener("click", async function () {
        const notes = notesText.value.trim();
        if (notes) {
          try {
            const response = await fetch(`${API_BASE}/notes`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${getCaregiverToken()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                note: notes,
              }),
            });

            if (response.ok) {
              notesText.value = "";
              notesStatus.innerHTML =
                '<div class="alert alert-success">Notes saved successfully!</div>';
              setTimeout(() => {
                notesStatus.innerHTML = "";
              }, 3000);
              fetchNotes();
            } else {
              const errorData = await response.json();
              notesStatus.innerHTML = `<div class="alert alert-danger">Failed to save note: ${
                errorData.detail || "Unknown error"
              }</div>`;
              setTimeout(() => {
                notesStatus.innerHTML = "";
              }, 3000);
            }
          } catch (error) {
            console.error("Error saving note:", error);
            notesStatus.innerHTML =
              '<div class="alert alert-danger">Error saving note</div>';
            setTimeout(() => {
              notesStatus.innerHTML = "";
            }, 3000);
          }
        }
      });
      saveNotesBtn.setAttribute("data-save-listener-added", "true");
    }

    fetchNotes();
  }
  async function loadGlucoseChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    try {
      const response = await fetch("/api/caregiver/patient/glucose", {
        headers: { Authorization: `Bearer ${getCaregiverToken()}` },
      });
      const glucoseData = response.ok ? await response.json() : [];
      const values = glucoseData.map((reading) => reading.value);
      const labels = values.map((_, i) => `Reading ${i + 1}`);

      if (window.glucoseCharts && window.glucoseCharts[canvasId]) {
        window.glucoseCharts[canvasId].destroy();
      }
      if (!window.glucoseCharts) window.glucoseCharts = {};
      window.glucoseCharts[canvasId] = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Glucose Level (mg/dL)",
              data: values,
              borderColor: "#b39ddb",
              backgroundColor: "rgba(255, 182, 185, 0.15)",
              pointBackgroundColor: "#ffb6b9",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              min: 50,
              max: 250,
              ticks: { stepSize: 25 },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error loading glucose chart:", error);
    }
  }

  document.getElementById("logout-btn").addEventListener("click", function () {
    sessionStorage.removeItem("caregiverPatientId");
    sessionStorage.removeItem("caregiverCode");
    window.location.href = "caregiver-login.html";
  });
});
