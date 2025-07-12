const API_BASE = "/api/caregiver";
const TOKEN_KEY = "access_token";

document.addEventListener("DOMContentLoaded", function () {
  if (!sessionStorage.getItem(TOKEN_KEY)) {
    window.location.href = "login.html";
    return;
  }

  const generateCodeBtn = document.getElementById("generate-code-btn");
  const codeDisplay = document.getElementById("code-display");
  const codeText = document.getElementById("code-text");
  const copyCodeBtn = document.getElementById("copy-code-btn");
  const codeInfo = document.getElementById("code-info");
  const currentNotes = document.getElementById("current-notes");

  console.log("Elements found:", {
    generateCodeBtn: !!generateCodeBtn,
    codeDisplay: !!codeDisplay,
    codeText: !!codeText,
    copyCodeBtn: !!copyCodeBtn,
    codeInfo: !!codeInfo,
    currentNotes: !!currentNotes,
  });

  if (!copyCodeBtn) {
    console.error("Copy button not found!");
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  async function fetchCaregiverCodes() {
    try {
      console.log("Fetching caregiver codes...");
      const res = await fetch(`${API_BASE}/codes`, {
        headers: { Authorization: "Bearer " + getToken() },
      });

      console.log("Fetch codes response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error fetching codes:", errorData);
        throw new Error(
          `Failed to fetch caregiver codes: ${
            errorData.detail || res.statusText
          }`
        );
      }

      const codes = await res.json();
      console.log("Fetched codes:", codes);

      if (codes.length > 0) {
        const latestCode = codes[0];
        codeText.textContent = latestCode.code;
        codeDisplay.style.display = "block";
        codeDisplay.classList.add("active");
        codeInfo.style.display = "block";
        const generatedDate = new Date(latestCode.created_at);
        codeInfo.textContent = `Generated on ${generatedDate.toLocaleDateString()} at ${generatedDate.toLocaleTimeString()}`;
        console.log("Displayed existing code:", latestCode.code);
      } else {
        console.log("No existing codes found");
      }
    } catch (err) {
      console.error("Could not load caregiver codes:", err);
    }
  }

  async function fetchCaregiverNotes() {
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        headers: { Authorization: "Bearer " + getToken() },
      });
      if (!res.ok) throw new Error("Failed to fetch caregiver notes");
      const notes = await res.json();
      renderCaregiverNotes(notes);
    } catch (err) {
      console.error("Could not load caregiver notes:", err);
    }
  }

  generateCodeBtn.addEventListener("click", async function () {
    try {
      console.log("Generating caregiver code...");
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to generate caregiver code: ${
            errorData.detail || res.statusText
          }`
        );
      }

      const newCode = await res.json();
      console.log("Generated code:", newCode);

      codeText.textContent = newCode.code;
      codeDisplay.style.display = "block";
      codeDisplay.classList.add("active");
      codeInfo.style.display = "block";
      const now = new Date();
      codeInfo.textContent = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;

      console.log("Code generated successfully");
    } catch (err) {
      console.error("Error generating code:", err);
      alert(
        `Could not generate caregiver code: ${err.message}. Please try again.`
      );
    }
  });

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener("click", function () {
      const code = codeText.textContent;
      console.log("Copying code:", code);

      if (!code) {
        console.error("No code to copy");
        alert("No code available to copy. Please generate a code first.");
        return;
      }

      const originalText = copyCodeBtn.innerHTML;
      const originalBackground = copyCodeBtn.style.background;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(code)
          .then(function () {
            console.log("Code copied to clipboard successfully");
            copyCodeBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            copyCodeBtn.style.background = "#28a745";
            copyCodeBtn.style.color = "white";

            setTimeout(() => {
              copyCodeBtn.innerHTML = originalText;
              copyCodeBtn.style.background = originalBackground;
              copyCodeBtn.style.color = "white";
            }, 2000);
          })
          .catch(function (err) {
            console.error("Clipboard API failed:", err);
            fallbackCopy();
          });
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        console.log("Using fallback copy method");

        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);

        try {
          textArea.focus();
          textArea.select();

          const successful = document.execCommand("copy");
          if (successful) {
            console.log("Code copied using fallback method");
            copyCodeBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            copyCodeBtn.style.background = "#28a745";
            copyCodeBtn.style.color = "white";

            setTimeout(() => {
              copyCodeBtn.innerHTML = originalText;
              copyCodeBtn.style.background = originalBackground;
              copyCodeBtn.style.color = "white";
            }, 2000);
          } else {
            throw new Error("execCommand copy failed");
          }
        } catch (fallbackErr) {
          console.error("Fallback copy failed:", fallbackErr);

          const message = `Could not copy automatically. Please copy this code manually:\n\n${code}`;
          alert(message);

          copyCodeBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
          copyCodeBtn.style.background = "#28a745";
          copyCodeBtn.style.color = "white";

          setTimeout(() => {
            copyCodeBtn.innerHTML = originalText;
            copyCodeBtn.style.background = originalBackground;
            copyCodeBtn.style.color = "white";
          }, 2000);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    });
  } else {
    console.error("Copy button not found - cannot add event listener");
  }

  function renderCaregiverNotes(notes) {
    if (notes.length > 0) {
      let html = '<div class="list-group">';
      notes.forEach((note, index) => {
        html += `<div class="list-group-item">`;
        html += `<div class="d-flex justify-content-between align-items-start">`;
        html += `<div class="flex-grow-1">`;
        if (index === 0) {
          html += `<strong>Latest Note:</strong><br>`;
        }
        html += `${note.note}`;
        html += `</div>`;
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
      currentNotes.innerHTML = html;

      const deleteButtons = currentNotes.querySelectorAll(".delete-note-btn");
      deleteButtons.forEach((btn) => {
        btn.addEventListener("click", async function () {
          const noteId = this.getAttribute("data-id");
          if (confirm("Are you sure you want to delete this note?")) {
            try {
              const res = await fetch(`${API_BASE}/notes/${noteId}`, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + getToken() },
              });
              if (!res.ok) throw new Error("Failed to delete note");
              await fetchCaregiverNotes();
              showMessage("Note deleted successfully!", "success");
            } catch (err) {
              showMessage("Could not delete note.", "error");
            }
          }
        });
      });
    } else {
      currentNotes.textContent = "No notes from caregiver yet.";
    }
  }

  function showMessage(message, type = "info") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `alert alert-${
      type === "success" ? "success" : type === "error" ? "danger" : "info"
    } alert-dismissible fade show mt-2`;
    messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
    currentNotes.parentNode.insertBefore(messageDiv, currentNotes);
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }

  function checkForNewNotes() {
    fetchCaregiverNotes();
  }

  document.getElementById("logout-btn").addEventListener("click", function () {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.href = "login.html";
  });

  fetchCaregiverCodes();
  fetchCaregiverNotes();
  setInterval(checkForNewNotes, 30000);
});
