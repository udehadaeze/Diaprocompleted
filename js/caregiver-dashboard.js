// Caregiver Dashboard Logic (Original, fully working version)
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation logic (tabbed navigation)
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(targetSection + '-section').style.display = 'block';
            // Load data for the selected section
            if (targetSection === 'dashboard') loadDashboardData();
            if (targetSection === 'medications') loadMedicationsData();
            if (targetSection === 'profile') loadProfileData();
            if (targetSection === 'glucose') loadGlucoseData();
            if (targetSection === 'refills') loadRefillsData();
            if (targetSection === 'notes') loadNotesData();
        });
    });

    // Show patient name instantly
    const patientId = sessionStorage.getItem('caregiverPatientId') || 'Patient';
    document.getElementById('patient-name').textContent = patientId;
    document.getElementById('patient-name-display').textContent = patientId;

    // Load all dashboard sections immediately
    loadDashboardData();
    loadMedicationsData();
    loadProfileData();
    loadGlucoseData();
    loadRefillsData();
    loadNotesData();

    // Data-loading functions (original logic, global/shared data, read-only)
    function loadDashboardData() {
        // Medications summary
        const medications = JSON.parse(localStorage.getItem('medications') || '[]');
        const medSummary = document.getElementById('medications-summary');
        if (medications.length > 0) {
            let html = '<ul class="list-unstyled">';
            medications.slice(0, 3).forEach(med => {
                html += `<li><i class="bi bi-capsule text-pink"></i> ${med.name} (${med.type})</li>`;
            });
            if (medications.length > 3) {
                html += `<li class="text-muted">... and ${medications.length - 3} more</li>`;
            }
            html += '</ul>';
            medSummary.innerHTML = html;
        } else {
            medSummary.innerHTML = '<p class="text-muted">No medications available</p>';
        }
        // Calendar/appointments summary
        const calendarReminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        const calendarSummary = document.getElementById('calendar-summary');
        if (calendarReminders.length > 0) {
            let html = '<ul class="list-unstyled">';
            const today = new Date();
            calendarReminders.slice(0, 5).forEach(reminder => {
                const reminderDate = new Date(reminder.date);
                const daysDiff = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));
                let dateText = '';
                if (daysDiff === 0) {
                    dateText = '<span class="badge bg-danger">TODAY</span>';
                } else if (daysDiff === 1) {
                    dateText = '<span class="badge bg-warning">TOMORROW</span>';
                } else if (daysDiff > 0 && daysDiff <= 7) {
                    dateText = `<span class="badge bg-info">In ${daysDiff} day${daysDiff > 1 ? 's' : ''}</span>`;
                } else {
                    dateText = `<span class="badge bg-secondary">${reminderDate.toLocaleDateString()}</span>`;
                }
                html += `<li class="mb-2"><i class="bi bi-calendar-event text-info"></i> ${dateText} ${reminder.text}</li>`;
            });
            if (calendarReminders.length > 5) {
                html += `<li class="text-muted">... and ${calendarReminders.length - 5} more appointments</li>`;
            }
            html += '</ul>';
            calendarSummary.innerHTML = html;
        } else {
            calendarSummary.innerHTML = '<p class="text-muted">No appointments available</p>';
        }
        // Glucose chart
        loadGlucoseChart('glucose-chart');
    }
    function loadMedicationsData() {
        const medications = JSON.parse(localStorage.getItem('medications') || '[]');
        const medList = document.getElementById('medications-list');
        if (medications.length > 0) {
            let html = '<div class="table-responsive"><table class="table">';
            html += '<thead><tr><th>Medication</th><th>Type</th><th>Schedule</th></tr></thead><tbody>';
            medications.forEach(med => {
                html += `<tr><td>${med.name}</td><td>${med.type}</td><td>${med.schedule}</td></tr>`;
            });
            html += '</tbody></table></div>';
            medList.innerHTML = html;
        } else {
            medList.innerHTML = '<p class="text-muted">No medications available</p>';
        }
    }
    function loadProfileData() {
        const profileInfo = document.getElementById('profile-info');
        const profileData = JSON.parse(localStorage.getItem('diapro_profile') || '{}');
        if (profileData.name || profileData.age || profileData.gender || profileData.weight) {
            let html = '<div class="row">';
            html += '<div class="col-md-6"><h4>Personal Information</h4>';
            html += `<p><strong>Name:</strong> ${profileData.name || 'Not specified'}</p>`;
            html += `<p><strong>Age:</strong> ${profileData.age || 'Not specified'}</p>`;
            html += `<p><strong>Gender:</strong> ${profileData.gender || 'Not specified'}</p>`;
            html += `<p><strong>Weight:</strong> ${profileData.weight || 'Not specified'} kg</p>`;
            html += '</div>';
            html += '<div class="col-md-6"><h4>Account Information</h4>';
            html += `<p><strong>Account Type:</strong> Patient</p>`;
            html += `<p><strong>Caregiver Access:</strong> Enabled</p>`;
            html += '</div></div>';
            profileInfo.innerHTML = html;
        } else {
            profileInfo.innerHTML = '<p class="text-muted">No profile information available</p>';
        }
    }
    function loadGlucoseData() {
        const glucoseData = JSON.parse(localStorage.getItem('glucoseData') || '[]');
        loadGlucoseChart('detailed-glucose-chart');
        const glucoseStats = document.getElementById('glucose-stats');
        if (glucoseData.length > 0) {
            const values = glucoseData.map(entry => typeof entry === 'number' ? entry : entry.value || entry);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            let html = '<div class="row">';
            html += `<div class="col-md-3"><div class="text-center"><h4>${avg.toFixed(0)}</h4><small class="text-muted">Average</small></div></div>`;
            html += `<div class="col-md-3"><div class="text-center"><h4>${min}</h4><small class="text-muted">Lowest</small></div></div>`;
            html += `<div class="col-md-3"><div class="text-center"><h4>${max}</h4><small class="text-muted">Highest</small></div></div>`;
            html += `<div class="col-md-3"><div class="text-center"><h4>${values.length}</h4><small class="text-muted">Readings</small></div></div>`;
            html += '</div>';
            glucoseStats.innerHTML = html;
        } else {
            glucoseStats.innerHTML = '<p class="text-muted">No glucose data available</p>';
        }
    }
    function loadRefillsData() {
        const refillRequests = document.getElementById('refill-requests');
        const refillRequestsData = JSON.parse(localStorage.getItem('refillRequests') || '[]');
        if (refillRequestsData.length > 0) {
            let html = '<div class="list-group">';
            refillRequestsData.forEach(order => {
                const statusClass = order.status === 'received' ? 'completed' : 'pending';
                const statusText = order.status === 'received' ? 'Received' : 'Pending';
                const statusIcon = order.status === 'received' ? 'bi-check-circle text-success' : 'bi-clock text-warning';
                html += `<div class="refill-request-item ${statusClass}">`;
                html += `<div class="d-flex justify-content-between align-items-start">`;
                html += `<div class="flex-grow-1">`;
                html += `<h6 class="mb-1">${order.medication}</h6>`;
                html += `<p class="mb-1">Quantity: ${order.quantity}</p>`;
                html += `<small class="text-muted">Requested: ${new Date(order.date).toLocaleDateString()}</small>`;
                html += `</div>`;
                html += `<div class="text-end">`;
                html += `<i class="bi ${statusIcon}"></i> ${statusText}`;
                html += `</div>`;
                html += `</div></div>`;
            });
            html += '</div>';
            refillRequests.innerHTML = html;
        } else {
            refillRequests.innerHTML = '<p class="text-muted">No refill requests found</p>';
        }
    }
    function loadNotesData() {
        const notesText = document.getElementById('caregiver-notes-text');
        const notesHistory = document.getElementById('notes-history');
        const saveNotesBtn = document.getElementById('save-notes-btn');
        const notesStatus = document.getElementById('notes-status');
        if (!notesText.hasAttribute('data-focus-listeners-added')) {
            notesText.addEventListener('focus', function() { window.isNotesFocused = true; });
            notesText.addEventListener('blur', function() { window.isNotesFocused = false; });
            notesText.setAttribute('data-focus-listeners-added', 'true');
        }
        // Only set textarea value from localStorage if not just saved and if there is an unsaved note
        if (!window.isNotesFocused && !window.justSavedNote) {
            const unsavedNote = localStorage.getItem('caregiverNotes');
            notesText.value = unsavedNote ? unsavedNote : '';
        }
        window.justSavedNote = false;
        const notesHistoryData = JSON.parse(localStorage.getItem('caregiverNotesHistory') || '[]');
        if (notesHistoryData.length > 0) {
            let html = '<div class="list-group">';
            notesHistoryData.forEach((note, index) => {
                html += `<div class="list-group-item">`;
                html += `<div class="d-flex justify-content-between align-items-start">`;
                html += `<div class="flex-grow-1">${note.text}</div>`;
                html += `<div class="d-flex align-items-center gap-2">`;
                html += `<small class="text-muted">${new Date(note.timestamp).toLocaleString()}</small>`;
                html += `<button class="btn btn-sm btn-outline-danger delete-note-btn" data-index="${index}" title="Delete note">`;
                html += `<i class="bi bi-trash"></i>`;
                html += `</button>`;
                html += `</div>`;
                html += `</div></div>`;
            });
            html += '</div>';
            notesHistory.innerHTML = html;
            const deleteButtons = notesHistory.querySelectorAll('.delete-note-btn');
            deleteButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (confirm('Are you sure you want to delete this note?')) {
                        const history = JSON.parse(localStorage.getItem('caregiverNotesHistory') || '[]');
                        history.splice(index, 1);
                        localStorage.setItem('caregiverNotesHistory', JSON.stringify(history));
                        notesStatus.innerHTML = '<div class="alert alert-success">Note deleted successfully!</div>';
                        setTimeout(() => { notesStatus.innerHTML = ''; }, 3000);
                        loadNotesData();
                    }
                });
            });
        } else {
            notesHistory.innerHTML = '<p class="text-muted">No previous notes</p>';
        }
        // Save notes functionality
        if (saveNotesBtn && !saveNotesBtn.hasAttribute('data-save-listener-added')) {
            saveNotesBtn.addEventListener('click', function() {
                const notes = notesText.value.trim();
                if (notes) {
                    // Remove unsaved note after saving
                    localStorage.removeItem('caregiverNotes');
                    const historyEntry = {
                        text: notes,
                        timestamp: new Date().toISOString()
                    };
                    const history = JSON.parse(localStorage.getItem('caregiverNotesHistory') || '[]');
                    history.unshift(historyEntry);
                    if (history.length > 10) history.splice(10);
                    localStorage.setItem('caregiverNotesHistory', JSON.stringify(history));
                    notesText.value = '';
                    notesStatus.innerHTML = '<div class="alert alert-success">Notes saved successfully!</div>';
                    setTimeout(() => { notesStatus.innerHTML = ''; }, 3000);
                    window.justSavedNote = true;
                    loadNotesData();
                }
            });
            saveNotesBtn.setAttribute('data-save-listener-added', 'true');
        }
        // Save unsaved note to localStorage on input (for draft persistence)
        notesText.addEventListener('input', function() {
            if (notesText.value.trim()) {
                localStorage.setItem('caregiverNotes', notesText.value);
            } else {
                localStorage.removeItem('caregiverNotes');
            }
        });
    }
    function loadGlucoseChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        const glucoseData = JSON.parse(localStorage.getItem('glucoseData') || '[]');
        const values = glucoseData.map(entry => typeof entry === 'number' ? entry : entry.value || entry);
        const labels = values.map((_, i) => `Reading ${i + 1}`);
        if (window.glucoseCharts && window.glucoseCharts[canvasId]) {
            window.glucoseCharts[canvasId].destroy();
        }
        if (!window.glucoseCharts) window.glucoseCharts = {};
        window.glucoseCharts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Glucose Level (mg/dL)',
                    data: values,
                    borderColor: '#b39ddb',
                    backgroundColor: 'rgba(255, 182, 185, 0.15)',
                    pointBackgroundColor: '#ffb6b9',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 50,
                        max: 250,
                        ticks: { stepSize: 25 }
                    }
                }
            }
        });
    }

    document.getElementById('logout-btn').addEventListener('click', function() {
        sessionStorage.removeItem('caregiverPatientId');
        sessionStorage.removeItem('caregiverCode');
        window.location.href = 'caregiver-login.html';
    });
}); 