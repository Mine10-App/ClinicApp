// app.js
// Main application logic

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const patientForm = document.getElementById('patient-form');
    const nameInput = document.getElementById('name');
    const idCardInput = document.getElementById('id-card');
    const addressInput = document.getElementById('address');
    const contactInput = document.getElementById('contact');
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');
    const nationalityInput = document.getElementById('nationality');
    const saveBtn = document.getElementById('save-btn');
    const clearBtn = document.getElementById('clear-btn');
    const patientList = document.getElementById('patient-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resetSearchBtn = document.getElementById('reset-search');
    
    // Auth elements
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userEmail = document.getElementById('user-email');
    const authError = document.getElementById('auth-error');
    
    // Variables
    let currentUser = null;
    let patients = [];
    
    // Initialize the application
    initApp();
    
    // Function to initialize the application
    function initApp() {
        // Set max date for DOB to today
        const today = new Date().toISOString().split('T')[0];
        dobInput.max = today;
        
        // Auth state observer
        auth.onAuthStateChanged(user => {
            currentUser = user;
            if (user) {
                // User is signed in
                loginForm.style.display = 'none';
                userInfo.style.display = 'block';
                userEmail.textContent = user.email;
                authError.textContent = '';
                
                // Enable form and load patients
                enableForm(true);
                loadPatients();
            } else {
                // User is signed out
                loginForm.style.display = 'block';
                userInfo.style.display = 'none';
                
                // Disable form and clear patients
                enableForm(false);
                patientList.innerHTML = '<div class="empty-state"><p>Please login to view and manage patient records.</p></div>';
            }
        });
        
        // Event Listeners
        dobInput.addEventListener('change', calculateAge);
        
        patientForm.addEventListener('submit', savePatient);
        clearBtn.addEventListener('click', clearForm);
        
        searchBtn.addEventListener('click', searchPatients);
        resetSearchBtn.addEventListener('click', resetSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') searchPatients();
        });
        
        // Auth event listeners
        loginBtn.addEventListener('click', loginUser);
        signupBtn.addEventListener('click', signupUser);
        logoutBtn.addEventListener('click', logoutUser);
        
        loginPassword.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') loginUser();
        });
    }
    
    // Function to calculate age from DOB
    function calculateAge() {
        const dob = new Date(dobInput.value);
        if (isNaN(dob.getTime())) return;
        
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        ageInput.value = age >= 0 ? age : '';
    }
    
    // Function to enable/disable form based on auth status
    function enableForm(enabled) {
        const formElements = patientForm.querySelectorAll('input, select, textarea, button');
        formElements.forEach(element => {
            if (element.id !== 'clear-btn') {
                element.disabled = !enabled;
            }
        });
        saveBtn.textContent = enabled ? 'Save Patient' : 'Please Login to Save';
    }
    
    // Function to save patient to Firestore
    async function savePatient(e) {
        e.preventDefault();
        
        if (!currentUser) {
            showMessage('Please login to save patient records.', 'error');
            return;
        }
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            
            // Create patient object
            const patient = {
                name: nameInput.value.trim(),
                idCard: idCardInput.value.trim(),
                address: addressInput.value.trim(),
                contact: contactInput.value.trim(),
                dob: dobInput.value,
                age: parseInt(ageInput.value),
                nationality: nationalityInput.value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentUser.uid,
                createdByEmail: currentUser.email
            };
            
            // Save to Firestore in the 'scans' collection as per your rules
            await db.collection('scans').add(patient);
            
            showMessage('Patient saved successfully!', 'success');
            clearForm();
            loadPatients();
            
        } catch (error) {
            console.error('Error saving patient:', error);
            showMessage(`Error saving patient: ${error.message}`, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Patient';
        }
    }
    
    // Function to validate form
    function validateForm() {
        // Simple validation
        if (!nameInput.value.trim()) {
            showMessage('Name is required', 'error');
            nameInput.focus();
            return false;
        }
        
        if (!idCardInput.value.trim()) {
            showMessage('ID Card number is required', 'error');
            idCardInput.focus();
            return false;
        }
        
        if (!contactInput.value.trim()) {
            showMessage('Contact number is required', 'error');
            contactInput.focus();
            return false;
        }
        
        if (!dobInput.value) {
            showMessage('Date of Birth is required', 'error');
            dobInput.focus();
            return false;
        }
        
        if (parseInt(ageInput.value) < 0) {
            showMessage('Age cannot be negative', 'error');
            dobInput.focus();
            return false;
        }
        
        return true;
    }
    
    // Function to load patients from Firestore
    async function loadPatients() {
        try {
            patientList.innerHTML = '<div class="loading">Loading patients...</div>';
            
            let query = db.collection('scans')
                .where('createdBy', '==', currentUser.uid)
                .orderBy('createdAt', 'desc');
            
            const snapshot = await query.get();
            
            patients = [];
            snapshot.forEach(doc => {
                patients.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            displayPatients(patients);
            
        } catch (error) {
            console.error('Error loading patients:', error);
            patientList.innerHTML = '<div class="error">Error loading patients. Please try again.</div>';
        }
    }
    
    // Function to display patients in the list
    function displayPatients(patientsToDisplay) {
        if (patientsToDisplay.length === 0) {
            patientList.innerHTML = '<div class="empty-state"><p>No patient records found.</p></div>';
            return;
        }
        
        patientList.innerHTML = '';
        
        patientsToDisplay.forEach(patient => {
            const patientCard = document.createElement('div');
            patientCard.className = 'patient-card';
            
            // Format the date
            let dateString = 'Date not available';
            if (patient.createdAt && patient.createdAt.toDate) {
                dateString = patient.createdAt.toDate().toLocaleDateString();
            } else if (patient.createdAt) {
                dateString = new Date(patient.createdAt.seconds * 1000).toLocaleDateString();
            }
            
            patientCard.innerHTML = `
                <div class="patient-header">
                    <h3>${patient.name}</h3>
                    <span class="patient-id">ID: ${patient.idCard}</span>
                </div>
                <div class="patient-details">
                    <p><strong>Nationality:</strong> ${patient.nationality}</p>
                    <p><strong>Age:</strong> ${patient.age} years</p>
                    <p><strong>Contact:</strong> ${patient.contact}</p>
                    <p><strong>DOB:</strong> ${patient.dob}</p>
                    <p><strong>Address:</strong> ${patient.address}</p>
                    <p class="patient-meta">Added on ${dateString}</p>
                </div>
                <div class="patient-actions">
                    <button class="delete-btn" data-id="${patient.id}">Delete</button>
                </div>
            `;
            
            patientList.appendChild(patientCard);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deletePatient);
        });
    }
    
    // Function to delete a patient
    async function deletePatient(e) {
        const patientId = e.target.getAttribute('data-id');
        
        if (!confirm('Are you sure you want to delete this patient record?')) {
            return;
        }
        
        try {
            await db.collection('scans').doc(patientId).delete();
            showMessage('Patient record deleted successfully!', 'success');
            loadPatients();
        } catch (error) {
            console.error('Error deleting patient:', error);
            showMessage(`Error deleting patient: ${error.message}`, 'error');
        }
    }
    
    // Function to search patients
    function searchPatients() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            displayPatients(patients);
            return;
        }
        
        const filteredPatients = patients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.idCard.toLowerCase().includes(searchTerm) ||
            patient.contact.toLowerCase().includes(searchTerm)
        );
        
        displayPatients(filteredPatients);
    }
    
    // Function to reset search
    function resetSearch() {
        searchInput.value = '';
        displayPatients(patients);
    }
    
    // Function to clear form
    function clearForm() {
        patientForm.reset();
        ageInput.value = '';
    }
    
    // Function to show messages
    function showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        // Add to page
        document.querySelector('.container').appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
    
    // Auth Functions
    async function loginUser() {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        
        if (!email || !password) {
            authError.textContent = 'Please enter email and password';
            return;
        }
        
        try {
            authError.textContent = '';
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Login error:', error);
            authError.textContent = `Login failed: ${error.message}`;
        }
    }
    
    async function signupUser() {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        
        if (!email || !password) {
            authError.textContent = 'Please enter email and password';
            return;
        }
        
        if (password.length < 6) {
            authError.textContent = 'Password must be at least 6 characters';
            return;
        }
        
        try {
            authError.textContent = '';
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Signup error:', error);
            authError.textContent = `Signup failed: ${error.message}`;
        }
    }
    
    async function logoutUser() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
});
