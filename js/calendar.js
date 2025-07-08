// Calendar and Reminders/Appointment Logic
// Simple calendar rendering, local storage, and notifications

document.addEventListener('DOMContentLoaded', function() {
    // Allow access if patient or caregiver is logged in
    const isPatient = !!sessionStorage.getItem('diapro_session');
    const isCaregiver = !!sessionStorage.getItem('caregiverPatientId') && !!sessionStorage.getItem('caregiverCode');
    if (!isPatient && !isCaregiver) {
        window.location.href = 'login.html';
        return;
    }

    // Elements
    const calendarContainer = document.getElementById('calendar-container');
    const reminderForm = document.getElementById('reminder-form');
    const reminderDate = document.getElementById('reminder-date');
    const reminderText = document.getElementById('reminder-text');
    const reminderList = document.getElementById('reminder-list');
    const currentMonthDisplay = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Calendar state
    let currentDate = new Date();
    let selectedDate = null;

    // Helpers
    function getReminders() {
        return JSON.parse(localStorage.getItem('reminders') || '[]');
    }
    
    function saveReminders(reminders) {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }
    
    function formatDate(date) {
        return date.toISOString().slice(0, 10);
    }
    
    function getRemindersForDate(dateStr) {
        return getReminders().filter(r => r.date === dateStr);
    }
    
    function renderReminders() {
        const reminders = getReminders();
        reminderList.innerHTML = '';
        
        if (reminders.length === 0) {
            reminderList.innerHTML = '<div class="empty-reminders">No reminders yet. Add your first appointment or reminder above!</div>';
            return;
        }
        
        // Sort reminders by date
        reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        reminders.forEach((rem, idx) => {
            const li = document.createElement('li');
            li.className = 'reminder-item';
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'reminder-date';
            const dateObj = new Date(rem.date);
            dateDiv.textContent = dateObj.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const textDiv = document.createElement('div');
            textDiv.className = 'reminder-text';
            textDiv.textContent = rem.text;
            
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '<i class="bi bi-trash"></i> Delete';
            delBtn.className = 'btn-delete-reminder';
            delBtn.onclick = () => {
                if (confirm('Are you sure you want to delete this reminder?')) {
                    reminders.splice(idx, 1);
                    saveReminders(reminders);
                    renderReminders();
                    renderCalendar();
                }
            };
            
            li.appendChild(dateDiv);
            li.appendChild(textDiv);
            li.appendChild(delBtn);
            reminderList.appendChild(li);
        });
    }

    // Enhanced Calendar UI with month navigation
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();
        
        // Update month display
        currentMonthDisplay.textContent = currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        let html = '<table class="calendar-table"><thead><tr>';
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        days.forEach(d => html += `<th>${d}</th>`);
        html += '</tr></thead><tbody><tr>';
        
        // Add empty cells for days before the first day of the month
        for(let i=0; i<firstDay.getDay(); i++) {
            html += '<td></td>';
        }
        
        // Add days of the month
        for(let d=1; d<=lastDay.getDate(); d++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dateObj = new Date(year, month, d);
            const reminders = getRemindersForDate(dateStr);
            const hasReminders = reminders.length > 0;
            const isToday = dateObj.toDateString() === today.toDateString();
            const isSelected = selectedDate === dateStr;
            
            let classes = [];
            if (isToday) classes.push('today');
            if (isSelected) classes.push('selected');
            if (hasReminders) classes.push('has-reminder');
            
            const classStr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
            
            html += `<td${classStr} data-date="${dateStr}">${d}`;
            if (hasReminders) {
                html += `<div style="font-size: 0.7em; margin-top: 2px; color: #ff8da1;">${reminders.length} reminder${reminders.length > 1 ? 's' : ''}</div>`;
            }
            html += '</td>';
            
            if((firstDay.getDay() + d) % 7 === 0) html += '</tr><tr>';
        }
        
        // Fill remaining cells in the last row
        const remainingCells = 7 - ((firstDay.getDay() + lastDay.getDate()) % 7);
        if (remainingCells < 7) {
            for(let i=0; i<remainingCells; i++) {
                html += '<td></td>';
            }
        }
        
        html += '</tr></tbody></table>';
        calendarContainer.innerHTML = html;
        
        // Add click handlers to calendar cells
        const cells = calendarContainer.querySelectorAll('td[data-date]');
        cells.forEach(cell => {
            cell.addEventListener('click', function() {
                const date = this.getAttribute('data-date');
                selectedDate = date;
                reminderDate.value = date;
                renderCalendar();
                
                // Show reminders for selected date
                const reminders = getRemindersForDate(date);
                if (reminders.length > 0) {
                    const reminderText = reminders.map(r => r.text).join('\n');
                    alert(`Reminders for ${new Date(date).toLocaleDateString()}:\n${reminderText}`);
                }
            });
        });
    }

    // Month navigation
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Add reminder
    reminderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const date = reminderDate.value;
        const text = reminderText.value.trim();
        
        if (!date || !text) {
            alert('Please fill in both date and reminder text.');
            return;
        }
        
        const reminders = getReminders();
        reminders.push({ date, text });
        saveReminders(reminders);
        renderReminders();
        renderCalendar();
        reminderForm.reset();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success';
        successMsg.innerHTML = '<i class="bi bi-check-circle"></i> Reminder added successfully!';
        reminderForm.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
    });

    // Set today's date as default
    reminderDate.value = formatDate(new Date());
    
    // Notification logic for today's reminders
    function showTodayReminders() {
        const today = formatDate(new Date());
        const reminders = getRemindersForDate(today);
        if(reminders.length > 0) {
            const reminderText = reminders.map(r => r.text).join('\n');
            setTimeout(() => {
                if (confirm(`Today's Reminders:\n${reminderText}\n\nWould you like to mark any as completed?`)) {
                    // Could implement completion logic here
                }
            }, 1000);
        }
    }

    // Initial render
    renderReminders();
    renderCalendar();
    showTodayReminders();
}); 