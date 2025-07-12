

const API_BASE = "/api/calendar";
const TOKEN_KEY = "access_token";

document.addEventListener("DOMContentLoaded", function () {
  if (!sessionStorage.getItem(TOKEN_KEY)) {
    window.location.href = "login.html";
    return;
  }

  
  const calendarContainer = document.getElementById("calendar-container");
  const reminderForm = document.getElementById("reminder-form");
  const reminderDate = document.getElementById("reminder-date");
  const reminderText = document.getElementById("reminder-text");
  const reminderList = document.getElementById("reminder-list");
  const currentMonthDisplay = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  
  let currentDate = new Date();
  let selectedDate = null;
  let calendarEvents = [];

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  
  async function fetchCalendarEvents() {
    try {
      const res = await fetch(API_BASE + "/", {
        headers: { Authorization: "Bearer " + getToken() },
      });
      if (!res.ok) throw new Error("Failed to fetch calendar events");
      calendarEvents = await res.json();
      renderReminders();
      renderCalendar();
    } catch (err) {
      showMessage("Could not load calendar events.", "error");
    }
  }

 
  function formatDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function getEventsForDate(dateStr) {
    return calendarEvents.filter((event) => event.event_date === dateStr);
  }

  function renderReminders() {
    reminderList.innerHTML = "";

    if (calendarEvents.length === 0) {
      reminderList.innerHTML =
        '<div class="empty-reminders">No reminders yet. Add your first appointment or reminder above!</div>';
      return;
    }

    
    calendarEvents.sort(
      (a, b) => new Date(a.event_date) - new Date(b.event_date)
    );

    calendarEvents.forEach((event, idx) => {
      const li = document.createElement("li");
      li.className = "reminder-item";

      const dateDiv = document.createElement("div");
      dateDiv.className = "reminder-date";
      const dateObj = new Date(event.event_date);
      dateDiv.textContent = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const textDiv = document.createElement("div");
      textDiv.className = "reminder-text";
      textDiv.textContent = event.title;
      if (event.description) {
        textDiv.textContent += ` - ${event.description}`;
      }

      const delBtn = document.createElement("button");
      delBtn.innerHTML = '<i class="bi bi-trash"></i> Delete';
      delBtn.className = "btn-delete-reminder";
      delBtn.onclick = () => deleteCalendarEvent(event.id);

      li.appendChild(dateDiv);
      li.appendChild(textDiv);
      li.appendChild(delBtn);
      reminderList.appendChild(li);
    });
  }

  
  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    
    currentMonthDisplay.textContent = currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    let html = '<table class="calendar-table"><thead><tr>';
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    days.forEach((d) => (html += `<th>${d}</th>`));
    html += "</tr></thead><tbody><tr>";

    
    for (let i = 0; i < firstDay.getDay(); i++) {
      html += "<td></td>";
    }

    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const dateObj = new Date(year, month, d);
      const events = getEventsForDate(dateStr);
      const hasEvents = events.length > 0;
      const isToday = dateObj.toDateString() === today.toDateString();
      const isSelected = selectedDate === dateStr;

      let classes = [];
      if (isToday) classes.push("today");
      if (isSelected) classes.push("selected");
      if (hasEvents) classes.push("has-reminder");

      const classStr =
        classes.length > 0 ? ` class="${classes.join(" ")}"` : "";

      html += `<td${classStr} data-date="${dateStr}">${d}`;
      if (hasEvents) {
        html += `<div style="font-size: 0.7em; margin-top: 2px; color: #ff8da1;">${
          events.length
        } event${events.length > 1 ? "s" : ""}</div>`;
      }
      html += "</td>";

      if ((firstDay.getDay() + d) % 7 === 0) html += "</tr><tr>";
    }

    
    const remainingCells = 7 - ((firstDay.getDay() + lastDay.getDate()) % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        html += "<td></td>";
      }
    }

    html += "</tr></tbody></table>";
    calendarContainer.innerHTML = html;

    
    const cells = calendarContainer.querySelectorAll("td[data-date]");
    cells.forEach((cell) => {
      cell.addEventListener("click", function () {
        const date = this.getAttribute("data-date");
        selectedDate = date;
        reminderDate.value = date;
        renderCalendar();

        
        const events = getEventsForDate(date);
        if (events.length > 0) {
          const eventText = events
            .map(
              (e) => `${e.title}${e.description ? " - " + e.description : ""}`
            )
            .join("\n");
          alert(
            `Events for ${new Date(date).toLocaleDateString()}:\n${eventText}`
          );
        }
      });
    });
  }

  
  prevMonthBtn.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  
  reminderForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const date = reminderDate.value;
    const text = reminderText.value.trim();

    if (!date || !text) {
      showMessage("Please fill in both date and reminder text.", "error");
      return;
    }

    try {
      const res = await fetch(API_BASE + "/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          title: text,
          description: "",
          event_date: date,
          event_time: null,
          reminder: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to add calendar event");

      await fetchCalendarEvents();
      reminderForm.reset();
      showMessage("Event added successfully!", "success");
    } catch (err) {
      showMessage("Could not add event.", "error");
    }
  });

  
  async function deleteCalendarEvent(eventId) {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await fetch(`${API_BASE}/${eventId}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + getToken() },
        });
        if (!res.ok) throw new Error("Failed to delete event");
        await fetchCalendarEvents();
        showMessage("Event deleted successfully!", "success");
      } catch (err) {
        showMessage("Could not delete event.", "error");
      }
    }
  }

  
  function showMessage(message, type = "info") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `alert alert-${
      type === "success" ? "success" : type === "error" ? "danger" : "info"
    } alert-dismissible fade show`;
    messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
    reminderForm.parentNode.insertBefore(messageDiv, reminderForm.nextSibling);
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }

  
  reminderDate.value = formatDate(new Date());

 
  fetchCalendarEvents();

 
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem("diapro_session");
      window.location.href = "login.html";
    });
  }
});
