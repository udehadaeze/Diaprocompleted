// Patient Caregiver Page Logic
// (Original, pre-user-specific version)
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const generateCodeBtn = document.getElementById('generate-code-btn');
    const codeDisplay = document.getElementById('code-display');
    const codeText = document.getElementById('code-text');
    const copyCodeBtn = document.getElementById('copy-code-btn');
    const codeInfo = document.getElementById('code-info');
    const currentNotes = document.getElementById('current-notes');

    // Generate unique caregiver code
    function generateCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Get current patient ID (using session or generate one)
    function getPatientId() {
        let patientId = sessionStorage.getItem('diapro_session');
        if (!patientId) {
            patientId = sessionStorage.getItem('caregiverPatientId');
        }
        if (!patientId) {
            patientId = 'patient_' + Date.now();
            sessionStorage.setItem('diapro_session', patientId);
        }
        return patientId;
    }

    // Save caregiver code
    function saveCaregiverCode(code) {
        const patientId = getPatientId();
        const patientCodes = JSON.parse(localStorage.getItem('patientCaregiverCodes') || '{}');
        Object.keys(patientCodes).forEach(existingCode => {
            if (patientCodes[existingCode] === patientId) {
                delete patientCodes[existingCode];
            }
        });
        patientCodes[code] = patientId;
        localStorage.setItem('patientCaregiverCodes', JSON.stringify(patientCodes));
        const codeInfo = {
            code: code,
            generatedAt: new Date().toISOString(),
            patientId: patientId
        };
        localStorage.setItem(`caregiverCode_${patientId}`, JSON.stringify(codeInfo));
    }

    // Load existing code
    function loadExistingCode() {
        const patientId = getPatientId();
        const codeInfo = JSON.parse(localStorage.getItem(`caregiverCode_${patientId}`) || 'null');
        if (codeInfo) {
            codeText.textContent = codeInfo.code;
            codeDisplay.style.display = 'block';
            codeDisplay.classList.add('active');
            const generatedDate = new Date(codeInfo.generatedAt);
            codeInfo.textContent = `Generated on ${generatedDate.toLocaleDateString()} at ${generatedDate.toLocaleTimeString()}`;
        }
    }

    // Generate new code
    generateCodeBtn.addEventListener('click', function() {
        const newCode = generateCode();
        codeText.textContent = newCode;
        codeDisplay.style.display = 'block';
        codeDisplay.classList.add('active');
        saveCaregiverCode(newCode);
        const now = new Date();
        codeInfo.textContent = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
    });

    // Copy code to clipboard
    copyCodeBtn.addEventListener('click', function() {
        const code = codeText.textContent;
        navigator.clipboard.writeText(code).then(function() {
            const originalText = copyCodeBtn.textContent;
            copyCodeBtn.textContent = 'Copied!';
            copyCodeBtn.style.background = '#28a745';
            setTimeout(() => {
                copyCodeBtn.textContent = originalText;
                copyCodeBtn.style.background = '#6c757d';
            }, 2000);
        }).catch(function(err) {
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            const originalText = copyCodeBtn.textContent;
            copyCodeBtn.textContent = 'Copied!';
            copyCodeBtn.style.background = '#28a745';
            setTimeout(() => {
                copyCodeBtn.textContent = originalText;
                copyCodeBtn.style.background = '#6c757d';
            }, 2000);
        });
    });

    // Load caregiver notes
    function loadCaregiverNotes() {
        const currentNote = localStorage.getItem('caregiverNotes');
        const notesHistory = JSON.parse(localStorage.getItem('caregiverNotesHistory') || '[]');
        if (notesHistory.length > 0) {
            let html = '<div class="list-group">';
            notesHistory.forEach((note, index) => {
                html += `<div class="list-group-item">`;
                html += `<div class="d-flex justify-content-between align-items-start">`;
                html += `<div class="flex-grow-1">`;
                if (index === 0 && currentNote && currentNote.trim()) {
                    html += `<strong>Latest Note:</strong><br>`;
                }
                html += `${note.text}`;
                html += `</div>`;
                html += `<div class="d-flex align-items-center gap-2">`;
                html += `<small class="text-muted">${new Date(note.timestamp).toLocaleString()}</small>`;
                html += `<button class="btn btn-sm btn-outline-danger delete-note-btn" data-index="${index}" title="Delete note">`;
                html += `<i class="bi bi-trash"></i>`;
                html += `</button>`;
                html += `</div>`;
                html += `</div></div>`;
            });
            html += '</div>';
            currentNotes.innerHTML = html;
            const deleteButtons = currentNotes.querySelectorAll('.delete-note-btn');
            deleteButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (confirm('Are you sure you want to delete this note?')) {
                        const history = JSON.parse(localStorage.getItem('caregiverNotesHistory') || '[]');
                        history.splice(index, 1);
                        localStorage.setItem('caregiverNotesHistory', JSON.stringify(history));
                        if (index === 0) {
                            localStorage.removeItem('caregiverNotes');
                        }
                        const successMsg = document.createElement('div');
                        successMsg.className = 'alert alert-success alert-dismissible fade show mt-2';
                        successMsg.innerHTML = `
                            Note deleted successfully!
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        `;
                        currentNotes.parentNode.insertBefore(successMsg, currentNotes);
                        setTimeout(() => {
                            if (successMsg.parentNode) {
                                successMsg.remove();
                            }
                        }, 3000);
                        loadCaregiverNotes();
                    }
                });
            });
        } else {
            currentNotes.textContent = 'No notes from caregiver yet.';
        }
    }

    // Check for new notes periodically
    function checkForNewNotes() {
        loadCaregiverNotes();
    }

    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function() {
        sessionStorage.removeItem('diapro_session');
        window.location.href = 'login.html';
    });

    // Initialize
    loadExistingCode();
    loadCaregiverNotes();
    setInterval(checkForNewNotes, 30000);
}); 