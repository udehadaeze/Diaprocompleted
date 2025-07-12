
const API_BASE = "/api/pharmacy";
const TOKEN_KEY = "access_token";

document.addEventListener("DOMContentLoaded", function () {
  if (!sessionStorage.getItem(TOKEN_KEY)) {
    window.location.href = "login.html";
    return;
  }

  
  const refillForm = document.getElementById("refill-form");
  const refillMedication = document.getElementById("refill-medication");
  const refillQuantity = document.getElementById("refill-quantity");
  const refillMedicationManual = document.getElementById(
    "refill-medication-manual"
  );
  const refillToggle = document.querySelectorAll('input[name="refill-mode"]');
  const refillOrders = document.getElementById("refill-orders");

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  
  async function fetchPharmacyOrders() {
    try {
      const res = await fetch(API_BASE + "/", {
        headers: { Authorization: "Bearer " + getToken() },
      });
      if (!res.ok) throw new Error("Failed to fetch pharmacy orders");
      const orders = await res.json();
      renderRefillOrders(orders);
    } catch (err) {
      showMessage("Could not load pharmacy orders.", "error");
    }
  }

 
  async function loadMedications() {
    try {
      const res = await fetch("/api/medications/", {
        headers: { Authorization: "Bearer " + getToken() },
      });
      if (!res.ok) throw new Error("Failed to fetch medications");
      return await res.json();
    } catch (err) {
      return [];
    }
  }

  
  async function renderRefillOptions() {
    if (!refillMedication) return;

    refillMedication.innerHTML = "";
    const medications = await loadMedications();

    if (medications.length > 0) {
      
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select a medication...";
      refillMedication.appendChild(defaultOption);

      
      medications.forEach((med, idx) => {
        const option = document.createElement("option");
        option.value = idx;
        option.textContent = `${med.name} (${med.medication_type})`;
        refillMedication.appendChild(option);
      });
    } else {
      const noMedsOption = document.createElement("option");
      noMedsOption.value = "";
      noMedsOption.textContent = "No medications found. Add medications first.";
      refillMedication.appendChild(noMedsOption);
    }
  }

  
  if (refillToggle && refillToggle.length) {
    refillToggle.forEach((radio) => {
      radio.addEventListener("change", function () {
        if (this.value === "manual") {
          if (refillMedication) {
            refillMedication.style.display = "none";
            refillMedication.required = false;
          }
          if (refillMedicationManual) {
            refillMedicationManual.style.display = "inline-block";
            refillMedicationManual.required = true;
          }
        } else {
          if (refillMedication) {
            refillMedication.style.display = "inline-block";
            refillMedication.required = true;
          }
          if (refillMedicationManual) {
            refillMedicationManual.style.display = "none";
            refillMedicationManual.required = false;
          }
        }
      });
    });
  }

  
  if (refillForm) {
    refillForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      let medName = "";
      const quantity = refillQuantity.value.trim();

      if (!quantity || quantity <= 0) {
        showMessage("Please enter a valid quantity", "error");
        return;
      }

      
      if (
        document.querySelector('input[name="refill-mode"]:checked').value ===
        "manual"
      ) {
        medName = refillMedicationManual.value.trim();
        if (!medName) {
          showMessage("Please enter a medication name", "error");
          return;
        }
      } else {
        const selectedIndex = refillMedication.value;
        const medications = await loadMedications();
        if (selectedIndex && medications[selectedIndex]) {
          medName = medications[selectedIndex].name;
        } else {
          showMessage("Please select a medication from the list", "error");
          return;
        }
      }

      
      await processRefillRequest(medName, quantity);
    });
  }

  async function processRefillRequest(medName, quantity) {
    
    const submitBtn = refillForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';
    submitBtn.disabled = true;

    try {
      const res = await fetch(API_BASE + "/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          medication_name: medName,
          quantity: parseInt(quantity),
          refill_type: "manual",
          notes: "",
        }),
      });

      if (!res.ok) throw new Error("Failed to create pharmacy order");

      
      showMessage(
        `Refill request for ${quantity} of ${medName} submitted successfully!`,
        "success"
      );

    
      refillForm.reset();
      refillMedicationManual.style.display = "none";
      refillMedication.style.display = "inline-block";

      
      await fetchPharmacyOrders();
    } catch (err) {
      showMessage("Could not submit refill request.", "error");
    } finally {
      
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  
  function renderRefillOrders(orders) {
    if (!refillOrders) return;

    if (orders.length === 0) {
      refillOrders.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">No refill requests yet</p>
                </div>
            `;
      return;
    }

    let html = "";
    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const statusText = order.status === "pending" ? "Pending" : "Received";

      html += `
                <div class="order-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${order.medication_name}</h6>
                            <p class="mb-1 text-muted">
                                <i class="bi bi-box"></i> Quantity: ${
                                  order.quantity
                                }
                            </p>
                            <small class="text-muted">
                                <i class="bi bi-calendar"></i> Requested: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
                            </small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm ${
                              order.status === "pending"
                                ? "btn-warning"
                                : "btn-success"
                            }" 
                                    onclick="toggleRefillStatus(${order.id})" 
                                    title="${
                                      order.status === "pending"
                                        ? "Click when you receive the medication"
                                        : "Mark as pending"
                                    }">
                                <i class="bi ${
                                  order.status === "pending"
                                    ? "bi-clock"
                                    : "bi-check-circle"
                                }"></i>
                                ${statusText}
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="cancelRefillRequest(${
                              order.id
                            })" title="Cancel request">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
    });

    refillOrders.innerHTML = html;
  }

  
  window.toggleRefillStatus = async function (orderId) {
    try {
      const res = await fetch(`${API_BASE}/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          status: "received",
        }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      await fetchPharmacyOrders();
      showMessage("Order status updated successfully!", "success");
    } catch (err) {
      showMessage("Could not update order status.", "error");
    }
  };

  
  window.cancelRefillRequest = async function (orderId) {
    if (confirm("Are you sure you want to cancel this refill request?")) {
      try {
        const res = await fetch(`${API_BASE}/${orderId}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + getToken() },
        });
        if (!res.ok) throw new Error("Failed to cancel order");
        await fetchPharmacyOrders();
        showMessage("Refill request cancelled successfully", "success");
      } catch (err) {
        showMessage("Could not cancel order.", "error");
      }
    }
  };

  
  function showMessage(message, type = "info") {
    
    const existingMessages = document.querySelectorAll(".alert");
    existingMessages.forEach((msg) => msg.remove());

  
    const messageDiv = document.createElement("div");
    messageDiv.className = `alert alert-${
      type === "success" ? "success" : type === "error" ? "danger" : "info"
    } alert-dismissible fade show mt-3`;
    messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    
    refillForm.parentNode.insertBefore(messageDiv, refillForm.nextSibling);


    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

 
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem(TOKEN_KEY);
      window.location.href = "login.html";
    });
  }

 
  renderRefillOptions();
  fetchPharmacyOrders();
});
