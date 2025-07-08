// Pharmacy Page Logic
document.addEventListener('DOMContentLoaded', function() {
    // Allow access if patient or caregiver is logged in
    const isPatient = !!sessionStorage.getItem('diapro_session');
    const isCaregiver = !!sessionStorage.getItem('caregiverPatientId') && !!sessionStorage.getItem('caregiverCode');
    if (!isPatient && !isCaregiver) {
        window.location.href = 'login.html';
        return;
    }

    // Elements
    const refillForm = document.getElementById('refill-form');
    const refillMedication = document.getElementById('refill-medication');
    const refillQuantity = document.getElementById('refill-quantity');
    const refillMedicationManual = document.getElementById('refill-medication-manual');
    const refillToggle = document.querySelectorAll('input[name="refill-mode"]');
    const refillOrders = document.getElementById('refill-orders');

    // Load medications from localStorage
    function loadMedications() {
        const medications = JSON.parse(localStorage.getItem('medications') || '[]');
        return medications;
    }

    // Render refill options
    function renderRefillOptions() {
        if (!refillMedication) return;
        
        refillMedication.innerHTML = '';
        const medications = loadMedications();
        
        if (medications.length > 0) {
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a medication...';
            refillMedication.appendChild(defaultOption);
            
            // Add medication options
            medications.forEach((med, idx) => {
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = `${med.name} (${med.type})`;
                refillMedication.appendChild(option);
            });
        } else {
            const noMedsOption = document.createElement('option');
            noMedsOption.value = '';
            noMedsOption.textContent = 'No medications found. Add medications first.';
            refillMedication.appendChild(noMedsOption);
        }
    }

    // Toggle between select and manual input
    if (refillToggle && refillToggle.length) {
        refillToggle.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'manual') {
                    if (refillMedication) {
                        refillMedication.style.display = 'none';
                        refillMedication.required = false;
                    }
                    if (refillMedicationManual) {
                        refillMedicationManual.style.display = 'inline-block';
                        refillMedicationManual.required = true;
                    }
                } else {
                    if (refillMedication) {
                        refillMedication.style.display = 'inline-block';
                        refillMedication.required = true;
                    }
                    if (refillMedicationManual) {
                        refillMedicationManual.style.display = 'none';
                        refillMedicationManual.required = false;
                    }
                }
            });
        });
    }

    // Handle refill form submission
    if (refillForm) {
        refillForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let medName = '';
            const quantity = refillQuantity.value.trim();
            
            if (!quantity || quantity <= 0) {
                showMessage('Please enter a valid quantity', 'error');
                return;
            }
            
            // Get medication name based on selected mode
            if (document.querySelector('input[name="refill-mode"]:checked').value === 'manual') {
                medName = refillMedicationManual.value.trim();
                if (!medName) {
                    showMessage('Please enter a medication name', 'error');
                    return;
                }
            } else {
                const selectedIndex = refillMedication.value;
                const medications = loadMedications();
                if (selectedIndex && medications[selectedIndex]) {
                    medName = medications[selectedIndex].name;
                } else {
                    showMessage('Please select a medication from the list', 'error');
                    return;
                }
            }
            
            // Process refill request
            processRefillRequest(medName, quantity);
        });
    }

    // Process refill request
    function processRefillRequest(medName, quantity) {
        // Show loading state
        const submitBtn = refillForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';
        submitBtn.disabled = true;
        
        // Simulate processing delay
        setTimeout(() => {
            // Save refill request to localStorage
            const refillRequests = JSON.parse(localStorage.getItem('refillRequests') || '[]');
            const newRequest = {
                id: Date.now(),
                medication: medName,
                quantity: parseInt(quantity),
                date: new Date().toISOString(),
                status: 'pending'
            };
            refillRequests.unshift(newRequest); // Add to beginning of array
            localStorage.setItem('refillRequests', JSON.stringify(refillRequests));
            
            // Show success message
            showMessage(`Refill request for ${quantity} of ${medName} submitted successfully!`, 'success');
            
            // Reset form
            refillForm.reset();
            refillMedicationManual.style.display = 'none';
            refillMedication.style.display = 'inline-block';
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Refresh medication options and orders
            renderRefillOptions();
            renderRefillOrders();
        }, 1500);
    }

    // Render refill orders
    function renderRefillOrders() {
        if (!refillOrders) return;
        
        const refillRequests = JSON.parse(localStorage.getItem('refillRequests') || '[]');
        
        if (refillRequests.length === 0) {
            refillOrders.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">No refill requests yet</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        refillRequests.forEach((request, index) => {
            const date = new Date(request.date);
            const statusText = request.status === 'pending' ? 'Pending' : 'Received';
            
            html += `
                <div class="order-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${request.medication}</h6>
                            <p class="mb-1 text-muted">
                                <i class="bi bi-box"></i> Quantity: ${request.quantity}
                            </p>
                            <small class="text-muted">
                                <i class="bi bi-calendar"></i> Requested: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
                            </small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm ${request.status === 'pending' ? 'btn-warning' : 'btn-success'}" 
                                    onclick="toggleRefillStatus(${request.id})" 
                                    title="${request.status === 'pending' ? 'Click when you receive the medication' : 'Mark as pending'}">
                                <i class="bi ${request.status === 'pending' ? 'bi-clock' : 'bi-check-circle'}"></i>
                                ${statusText}
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="cancelRefillRequest(${request.id})" title="Cancel request">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        refillOrders.innerHTML = html;
    }

    // Toggle refill status function (global scope for onclick)
    window.toggleRefillStatus = function(requestId) {
        const refillRequests = JSON.parse(localStorage.getItem('refillRequests') || '[]');
        const requestIndex = refillRequests.findIndex(request => request.id === requestId);
        
        if (requestIndex !== -1) {
            const currentStatus = refillRequests[requestIndex].status;
            const newStatus = currentStatus === 'pending' ? 'received' : 'pending';
            
            refillRequests[requestIndex].status = newStatus;
            
            // Add received date if marking as received
            if (newStatus === 'received') {
                refillRequests[requestIndex].receivedDate = new Date().toISOString();
            } else {
                delete refillRequests[requestIndex].receivedDate;
            }
            
            localStorage.setItem('refillRequests', JSON.stringify(refillRequests));
            renderRefillOrders();
            
            const statusText = newStatus === 'received' ? 'received' : 'pending';
            showMessage(`Refill request marked as ${statusText}`, 'success');
        }
    };

    // Cancel refill request function (global scope for onclick)
    window.cancelRefillRequest = function(requestId) {
        if (confirm('Are you sure you want to cancel this refill request?')) {
            const refillRequests = JSON.parse(localStorage.getItem('refillRequests') || '[]');
            const updatedRequests = refillRequests.filter(request => request.id !== requestId);
            localStorage.setItem('refillRequests', JSON.stringify(updatedRequests));
            renderRefillOrders();
            showMessage('Refill request cancelled successfully', 'success');
        }
    };

    // Show message function
    function showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.alert');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show mt-3`;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert after the form
        refillForm.parentNode.insertBefore(messageDiv, refillForm.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('diapro_session');
            window.location.href = 'login.html';
        });
    }

    // Initialize
    renderRefillOptions();
    renderRefillOrders();
}); 