// Use session username for welcome
const SESSION_KEY = 'diapro_session';

document.addEventListener('DOMContentLoaded', function() {
    const username = sessionStorage.getItem(SESSION_KEY) || 'User';
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = username;
    } else {
        console.error('Username element not found');
    }

    // Initialize reminders
    updateAllReminders();
    cycleReminders();
    setInterval(cycleReminders, 4000); // Change reminder every 4 seconds
});

// Fun facts
const funFacts = [
    'Did you know? Keeping glucose in range helps prevent complications!',
    'Fun fact: Regular exercise can help manage your blood sugar levels.',
    'Tip: Stay hydrated! Water helps control blood sugar.',
    'Did you know? Diapro helps you track your health easily!',
    'Tip: Eating balanced meals can help keep your glucose steady.'
];
let funFactIndex = 0;
function showFunFact() {
    document.getElementById('fun-fact').textContent = funFacts[funFactIndex % funFacts.length];
    funFactIndex++;
}
showFunFact();
setInterval(showFunFact, 4000);

// Chart.js for glucose graph
let glucoseData = JSON.parse(localStorage.getItem('glucoseData') || '[]');
const glucoseForm = document.getElementById('glucose-form');
const glucoseInput = document.getElementById('glucose-input');
const glucoseStatus = document.getElementById('glucose-status');
const ctx = document.getElementById('glucose-graph').getContext('2d');

// Create better labels for the x-axis
function createLabels(data) {
    if (data.length === 0) return [];
    return data.map((_, i) => `Reading ${i + 1}`);
}

let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: createLabels(glucoseData),
        datasets: [{
            label: 'Glucose Level (mg/dL)',
            data: glucoseData,
            borderColor: '#b39ddb',
            backgroundColor: 'rgba(179, 157, 219, 0.2)',
            pointBackgroundColor: '#ffb6b9',
            pointBorderColor: '#b39ddb',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            stepped: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: false 
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#b39ddb',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: function(context) {
                        return `Reading ${context[0].dataIndex + 1}`;
                    },
                    label: function(context) {
                        return `Glucose: ${context.parsed.y} mg/dL`;
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Glucose Readings',
                    color: '#666',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Glucose Level (mg/dL)',
                    color: '#666',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                min: 50,
                max: 250,
                ticks: { 
                    stepSize: 25,
                    color: '#666',
                    font: {
                        size: 10
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        elements: {
            point: {
                hoverBorderWidth: 3
            }
        }
    }
});

function getStatusColor(value) {
    if (value < 70) return {text: 'Too Low', color: '#ffb6b9'};
    if (value > 180) return {text: 'Too High', color: '#ff8da1'};
    return {text: 'Safe', color: '#b39ddb'};
}

function updateStatus(value) {
    const status = getStatusColor(value);
    glucoseStatus.textContent = `Status: ${status.text}`;
    glucoseStatus.style.color = status.color;
}

// Function to update chart with new data
function updateChart() {
    chart.data.labels = createLabels(glucoseData);
    chart.data.datasets[0].data = glucoseData;
    chart.update('active');
}

glucoseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const value = parseInt(glucoseInput.value);
    if (!isNaN(value) && value > 0) {
        glucoseData.push(value);
        updateChart();
        updateStatus(value);
        glucoseInput.value = '';
        
        // Save glucose data to localStorage for caregiver access
        localStorage.setItem('glucoseData', JSON.stringify(glucoseData));
        
        // Show success message
        showGlucoseMessage(`Glucose reading of ${value} mg/dL added successfully!`, 'success');
    } else {
        showGlucoseMessage('Please enter a valid glucose level (positive number)', 'error');
    }
});

// Function to show messages
function showGlucoseMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mt-2`;
    messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert after the glucose form
    const glucoseSection = document.querySelector('.glucose-section');
    glucoseSection.appendChild(messageDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Intelligent Reminder System
const reminderPopups = document.getElementById('reminder-popups');
let allReminders = [];
let reminderIndex = 0;

// Helper functions
function getMedications() {
    return JSON.parse(localStorage.getItem('medications') || '[]');
}

function getCalendarReminders() {
    return JSON.parse(localStorage.getItem('reminders') || '[]');
}

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

// Generate medication reminders
function generateMedicationReminders() {
    const medications = getMedications();
    const medicationReminders = [];
    
    medications.forEach(med => {
        // Use the original schedule text exactly as entered by the user
        const timeInfo = med.schedule;
        
        medicationReminders.push({
            text: `💊 Take ${med.name} (${med.type}) - ${timeInfo}`,
            type: 'medication',
            priority: 'high',
            medication: med.name
        });
    });
    
    return medicationReminders;
}

// Generate calendar/appointment reminders
function generateCalendarReminders() {
    const calendarReminders = getCalendarReminders();
    const today = new Date();
    const todayStr = formatDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);
    const calendarRemindersList = [];
    
    calendarReminders.forEach(reminder => {
        if (reminder.date === todayStr) {
            calendarRemindersList.push({
                text: `📅 TODAY: ${reminder.text}`,
                type: 'appointment',
                priority: 'high',
                originalText: reminder.text
            });
        } else if (reminder.date === tomorrowStr) {
            calendarRemindersList.push({
                text: `📅 TOMORROW: ${reminder.text}`,
                type: 'appointment',
                priority: 'medium',
                originalText: reminder.text
            });
        } else {
            // Show upcoming appointments within next 7 days
            const reminderDate = new Date(reminder.date);
            const daysDiff = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));
            if (daysDiff > 0 && daysDiff <= 7) {
                calendarRemindersList.push({
                    text: `📅 In ${daysDiff} day${daysDiff > 1 ? 's' : ''}: ${reminder.text}`,
                    type: 'appointment',
                    priority: 'medium',
                    originalText: reminder.text
                });
            }
        }
    });
    
    return calendarRemindersList;
}

// Generate health tips
function generateHealthTips() {
    const healthTips = [
        "💧 Stay hydrated! Drink plenty of water throughout the day",
        "🚶 Take a short walk to help manage your blood sugar levels",
        "📊 Remember to check your glucose levels regularly",
        "👣 Check your feet for any signs of complications",
        "🍎 Eat balanced meals to keep your glucose steady",
        "😴 Get enough sleep - it helps with blood sugar control",
        "🧘 Practice stress management techniques",
        "📝 Keep track of your meals and glucose readings"
    ];
    
    // Always include at least one health tip
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    return [{
        text: randomTip,
        type: 'tip',
        priority: 'low'
    }];
}

// Update all reminders
function updateAllReminders() {
    allReminders = [
        ...generateMedicationReminders(),
        ...generateCalendarReminders(),
        ...generateHealthTips()
    ];
    
    // If no reminders at all, show a default message
    if (allReminders.length === 0) {
        allReminders = [{
            text: "✅ You're all caught up! No reminders for today.",
            type: 'status',
            priority: 'low'
        }];
    }
    
    // Reset index if we have new reminders
    if (reminderIndex >= allReminders.length) {
        reminderIndex = 0;
    }
}

// Show reminder popup
function showReminder(reminder) {
    reminderPopups.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'reminder-popup';
    div.textContent = reminder.text;
    reminderPopups.appendChild(div);
}

// Cycle through reminders
function cycleReminders() {
    if (allReminders.length === 0) {
        updateAllReminders();
    }
    
    if (allReminders.length > 0) {
        showReminder(allReminders[reminderIndex % allReminders.length]);
        reminderIndex++;
    }
}

// Listen for medication changes
window.addEventListener('medicationsUpdated', function() {
    updateAllReminders();
});

// Listen for calendar changes
window.addEventListener('storage', function(e) {
    if (e.key === 'reminders') {
        updateAllReminders();
    }
});

document.getElementById('clear-glucose-btn').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all glucose readings? This cannot be undone.')) {
        glucoseData = [];
        localStorage.setItem('glucoseData', JSON.stringify(glucoseData));
        updateChart();
        glucoseStatus.textContent = 'Status: No readings yet';
        glucoseStatus.style.color = '#666';
        showGlucoseMessage('All glucose readings have been cleared.', 'success');
    }
}); 