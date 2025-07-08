const profileForm = document.getElementById('profile-form');
const profileName = document.getElementById('profile-name');
const profileAge = document.getElementById('profile-age');
const profileGender = document.getElementById('profile-gender');
const profileWeight = document.getElementById('profile-weight');
const profileMessage = document.getElementById('profile-message');

// Load profile from localStorage
function loadProfile() {
    const data = JSON.parse(localStorage.getItem('diapro_profile') || '{}');
    if (data.name) profileName.value = data.name;
    if (data.age) profileAge.value = data.age;
    if (data.gender) profileGender.value = data.gender;
    if (data.weight) profileWeight.value = data.weight;
}

// Save profile to localStorage
profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
        name: profileName.value,
        age: profileAge.value,
        gender: profileGender.value,
        weight: profileWeight.value
    };
    localStorage.setItem('diapro_profile', JSON.stringify(data));
    profileMessage.textContent = 'Profile saved!';
    setTimeout(() => profileMessage.textContent = '', 3000);
});

// Initial load
loadProfile();

document.addEventListener('DOMContentLoaded', function() {
    // Allow access if patient or caregiver is logged in
    const isPatient = !!sessionStorage.getItem('diapro_session');
    const isCaregiver = !!sessionStorage.getItem('caregiverPatientId') && !!sessionStorage.getItem('caregiverCode');
    if (!isPatient && !isCaregiver) {
        window.location.href = 'login.html';
        return;
    }
}); 