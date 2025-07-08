let medications = [
    { name: 'Insulin', type: 'Injection', schedule: 'Daily at 7am' },
    { name: 'Metformin', type: 'Tablet', schedule: 'Twice daily' }
];

// Load medications from localStorage if available
let storedMeds = JSON.parse(localStorage.getItem('medications') || '[]');
if (storedMeds.length > 0) {
    medications = storedMeds;
}

const medList = document.getElementById('medication-list');
const addMedForm = document.getElementById('add-medication-form');
const medName = document.getElementById('med-name');
const medType = document.getElementById('med-type');
const medSchedule = document.getElementById('med-schedule');

// Edit state management
let editingIndex = -1;
let isEditMode = false;

function renderMedications() {
    if (medList) {
        medList.innerHTML = '';
        medications.forEach((med, idx) => {
            const li = document.createElement('li');
            li.className = 'medication-item mb-3 p-3 border rounded';
            
            const info = document.createElement('div');
            info.className = 'med-info mb-2';
            info.innerHTML = `
                <h5 class="mb-1">${med.name}</h5>
                <p class="mb-1 text-muted"><strong>Type:</strong> ${med.type}</p>
                <p class="mb-0 text-muted"><strong>Schedule:</strong> ${med.schedule}</p>
            `;
            
            const actions = document.createElement('div');
            actions.className = 'med-actions d-flex gap-2';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-outline-primary btn-sm';
            editBtn.innerHTML = '<i class="bi bi-pencil"></i> Edit';
            editBtn.onclick = () => editMedication(idx);
            
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-outline-danger btn-sm';
            delBtn.innerHTML = '<i class="bi bi-trash"></i> Delete';
            delBtn.onclick = () => deleteMedication(idx);
            
            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            li.appendChild(info);
            li.appendChild(actions);
            medList.appendChild(li);
        });
    }
}

addMedForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = medName.value.trim();
    const type = medType.value.trim();
    const schedule = medSchedule.value.trim();
    
    if (!name || !type || !schedule) {
        alert('Please fill in all fields');
        return;
    }
    
    if (isEditMode) {
        // Update existing medication
        medications[editingIndex] = {
            name: name,
            type: type,
            schedule: schedule
        };
        isEditMode = false;
        editingIndex = -1;
        
        // Change button text back to "Add Medication"
        const submitBtn = addMedForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = 'Add Medication';
        submitBtn.className = 'btn btn-pink fw-bold';
    } else {
        // Add new medication
        medications.push({
            name: name,
            type: type,
            schedule: schedule
        });
    }
    
    // Clear form
    medName.value = '';
    medType.value = '';
    medSchedule.value = '';
    
    // Save and render
    saveMedications();
    renderMedications();
    
    // Trigger reminder system update
    triggerReminderUpdate();
    
    // Show success message
    showMessage('Medication saved successfully!', 'success');
});

function editMedication(idx) {
    const med = medications[idx];
    
    // Fill form with medication data
    medName.value = med.name;
    medType.value = med.type;
    medSchedule.value = med.schedule;
    
    // Set edit mode
    isEditMode = true;
    editingIndex = idx;
    
    // Change button text
    const submitBtn = addMedForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = 'Update Medication';
    submitBtn.className = 'btn btn-warning fw-bold';
    
    // Focus on first field
    medName.focus();
    
    // Scroll to form
    addMedForm.scrollIntoView({ behavior: 'smooth' });
}

function deleteMedication(idx) {
    if (confirm('Are you sure you want to delete this medication?')) {
        medications.splice(idx, 1);
        saveMedications();
        renderMedications();
        
        // Trigger reminder system update
        triggerReminderUpdate();
        
        showMessage('Medication deleted successfully!', 'success');
        
        // If we were editing this medication, clear edit mode
        if (isEditMode && editingIndex === idx) {
            clearEditMode();
        }
    }
}

function clearEditMode() {
    isEditMode = false;
    editingIndex = -1;
    
    // Clear form
    medName.value = '';
    medType.value = '';
    medSchedule.value = '';
    
    // Change button text back
    const submitBtn = addMedForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = 'Add Medication';
    submitBtn.className = 'btn btn-pink fw-bold';
}

// Save medications to localStorage on add/edit/delete
function saveMedications() {
    localStorage.setItem('medications', JSON.stringify(medications));
}

// Trigger reminder system update
function triggerReminderUpdate() {
    // Dispatch custom event to notify dashboard.js
    const event = new CustomEvent('medicationsUpdated', {
        detail: { medications: medications }
    });
    window.dispatchEvent(event);
}

// Show message function
function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of main content
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Allow access if patient or caregiver is logged in
    const isPatient = !!sessionStorage.getItem('diapro_session');
    const isCaregiver = !!sessionStorage.getItem('caregiverPatientId') && !!sessionStorage.getItem('caregiverCode');
    if (!isPatient && !isCaregiver) {
        window.location.href = 'login.html';
        return;
    }
    renderMedications();
    
    // Trigger initial reminder update
    triggerReminderUpdate();
}); 