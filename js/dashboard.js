
const SESSION_KEY = "diapro_session";
const TOKEN_KEY = "access_token";
const API_BASE = "/api/glucose";

document.addEventListener("DOMContentLoaded", function () {
  const username = sessionStorage.getItem(SESSION_KEY) || "User";
  const usernameElement = document.getElementById("username");
  if (usernameElement) {
    usernameElement.textContent = username;
  } else {
    console.error("Username element not found");
  }

  
  fetchGlucoseReadings();

  
  updateAllReminders().then(() => {
    cycleReminders();
    setInterval(cycleReminders, 4000); 
  });
});


const funFacts = [
  "Did you know? Keeping glucose in range helps prevent complications!",
  "Fun fact: Regular exercise can help manage your blood sugar levels.",
  "Tip: Stay hydrated! Water helps control blood sugar.",
  "Did you know? Diapro helps you track your health easily!",
  "Tip: Eating balanced meals can help keep your glucose steady.",
];
let funFactIndex = 0;
function showFunFact() {
  document.getElementById("fun-fact").textContent =
    funFacts[funFactIndex % funFacts.length];
  funFactIndex++;
}
showFunFact();
setInterval(showFunFact, 4000);


let glucoseData = [];
const glucoseForm = document.getElementById("glucose-form");
const glucoseInput = document.getElementById("glucose-input");
const glucoseStatus = document.getElementById("glucose-status");
const ctx = document.getElementById("glucose-graph").getContext("2d");

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}


function createLabels(data) {
  if (data.length === 0) return [];
  return data.map((_, i) => `Reading ${i + 1}`);
}

let chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: createLabels(glucoseData),
    datasets: [
      {
        label: "Glucose Level (mg/dL)",
        data: glucoseData,
        borderColor: "#b39ddb",
        backgroundColor: "rgba(179, 157, 219, 0.2)",
        pointBackgroundColor: "#ffb6b9",
        pointBorderColor: "#b39ddb",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        stepped: false,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#b39ddb",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function (context) {
            return `Reading ${context[0].dataIndex + 1}`;
          },
          label: function (context) {
            return `Glucose: ${context.parsed.y} mg/dL`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Glucose Readings",
          color: "#666",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#666",
          font: {
            size: 10,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Glucose Level (mg/dL)",
          color: "#666",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        min: 50,
        max: 250,
        ticks: {
          stepSize: 25,
          color: "#666",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
  },
});

function getStatusColor(value) {
  if (value < 70) return { text: "Too Low", color: "#ffb6b9" };
  if (value > 180) return { text: "Too High", color: "#ff8da1" };
  return { text: "Safe", color: "#b39ddb" };
}

function updateStatus(value) {
  const status = getStatusColor(value);
  glucoseStatus.textContent = `Status: ${status.text}`;
  glucoseStatus.style.color = status.color;
}


function updateChart() {
  chart.data.labels = createLabels(glucoseData);
  chart.data.datasets[0].data = glucoseData;
  chart.update("active");
}


async function fetchGlucoseReadings() {
  try {
    const res = await fetch(API_BASE + "/", {
      headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) throw new Error("Failed to fetch glucose readings");
    const readings = await res.json();
    glucoseData = readings.map((reading) => reading.value);
    updateChart();
    if (glucoseData.length > 0) {
      updateStatus(glucoseData[glucoseData.length - 1]);
    } else {
      glucoseStatus.textContent = "Status: No readings yet";
      glucoseStatus.style.color = "#666";
    }
  } catch (err) {
    showGlucoseMessage("Could not load glucose readings.", "error");
  }
}

glucoseForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const value = parseInt(glucoseInput.value);
  if (!isNaN(value) && value > 0) {
    try {
      const res = await fetch(API_BASE + "/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ value: value }),
      });
      if (!res.ok) throw new Error("Failed to add glucose reading");
      const newReading = await res.json();
      glucoseData.push(newReading.value);
      updateChart();
      updateStatus(value);
      glucoseInput.value = "";

    
      showGlucoseMessage(
        `Glucose reading of ${value} mg/dL added successfully!`,
        "success"
      );
    } catch (err) {
      showGlucoseMessage("Could not add glucose reading.", "error");
    }
  } else {
    showGlucoseMessage(
      "Please enter a valid glucose level (positive number)",
      "error"
    );
  }
});


function showGlucoseMessage(message, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `alert alert-${
    type === "success" ? "success" : "danger"
  } alert-dismissible fade show mt-2`;
  messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  
  const glucoseSection = document.querySelector(".glucose-section");
  glucoseSection.appendChild(messageDiv);

  
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 3000);
}


const reminderPopups = document.getElementById("reminder-popups");
let allReminders = [];
let reminderIndex = 0;


let medications = [];
let calendarEvents = [];

async function fetchMedications() {
  try {
    const res = await fetch("/api/medications/", {
      headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) throw new Error("Failed to fetch medications");
    medications = await res.json();
  } catch (err) {
    console.error("Could not load medications for reminders:", err);
  }
}

async function fetchCalendarEvents() {
  try {
    const res = await fetch("/api/calendar/", {
      headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) throw new Error("Failed to fetch calendar events");
    calendarEvents = await res.json();
  } catch (err) {
    console.error("Could not load calendar events for reminders:", err);
  }
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}


function generateMedicationReminders() {
  const medicationReminders = [];

  medications.forEach((med) => {
    
    const timeInfo = med.schedule;

    medicationReminders.push({
      text: `💊 Take ${med.name} (${med.medication_type}) - ${timeInfo}`,
      type: "medication",
      priority: "high",
      medication: med.name,
    });
  });

  return medicationReminders;
}


function generateCalendarReminders() {
  const today = new Date();
  const todayStr = formatDate(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);
  const calendarRemindersList = [];

  calendarEvents.forEach((event) => {
    if (event.event_date === todayStr) {
      calendarRemindersList.push({
        text: `📅 TODAY: ${event.title}`,
        type: "appointment",
        priority: "high",
        originalText: event.title,
      });
    } else if (event.event_date === tomorrowStr) {
      calendarRemindersList.push({
        text: `📅 TOMORROW: ${event.title}`,
        type: "appointment",
        priority: "medium",
        originalText: event.title,
      });
    } else {
      
      const eventDate = new Date(event.event_date);
      const daysDiff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0 && daysDiff <= 7) {
        calendarRemindersList.push({
          text: `📅 In ${daysDiff} day${daysDiff > 1 ? "s" : ""}: ${
            event.title
          }`,
          type: "appointment",
          priority: "medium",
          originalText: event.title,
        });
      }
    }
  });

  return calendarRemindersList;
}


function generateHealthTips() {
  const healthTips = [
    "💧 Stay hydrated! Drink plenty of water throughout the day",
    "🚶 Take a short walk to help manage your blood sugar levels",
    "📊 Remember to check your glucose levels regularly",
    "👣 Check your feet for any signs of complications",
    "🍎 Eat balanced meals to keep your glucose steady",
    "😴 Get enough sleep - it helps with blood sugar control",
    "🧘 Practice stress management techniques",
    "📝 Keep track of your meals and glucose readings",
  ];


  const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
  return [
    {
      text: randomTip,
      type: "tip",
      priority: "low",
    },
  ];
}


async function updateAllReminders() {
  
  await Promise.all([fetchMedications(), fetchCalendarEvents()]);

  allReminders = [
    ...generateMedicationReminders(),
    ...generateCalendarReminders(),
    ...generateHealthTips(),
  ];

  
  if (allReminders.length === 0) {
    allReminders = [
      {
        text: "✅ You're all caught up! No reminders for today.",
        type: "status",
        priority: "low",
      },
    ];
  }

 
  if (reminderIndex >= allReminders.length) {
    reminderIndex = 0;
  }
}


function showReminder(reminder) {
  reminderPopups.innerHTML = "";
  const div = document.createElement("div");
  div.className = "reminder-popup";
  div.textContent = reminder.text;
  reminderPopups.appendChild(div);
}


function cycleReminders() {
  if (allReminders.length === 0) {
    updateAllReminders();
  }

  if (allReminders.length > 0) {
    showReminder(allReminders[reminderIndex % allReminders.length]);
    reminderIndex++;
  }
}


window.addEventListener("medicationsUpdated", function () {
  updateAllReminders();
});


window.addEventListener("storage", function (e) {
  if (e.key === "reminders") {
    updateAllReminders();
  }
});

document
  .getElementById("clear-glucose-btn")
  .addEventListener("click", async function () {
    if (
      confirm(
        "Are you sure you want to clear all glucose readings? This cannot be undone."
      )
    ) {
      try {
        const res = await fetch(API_BASE + "/", {
          method: "DELETE",
          headers: { Authorization: "Bearer " + getToken() },
        });
        if (!res.ok) throw new Error("Failed to clear glucose readings");
        glucoseData = [];
        updateChart();
        glucoseStatus.textContent = "Status: No readings yet";
        glucoseStatus.style.color = "#666";
        showGlucoseMessage(
          "All glucose readings have been cleared.",
          "success"
        );
      } catch (err) {
        showGlucoseMessage("Could not clear glucose readings.", "error");
      }
    }
  });


const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
  });
}
