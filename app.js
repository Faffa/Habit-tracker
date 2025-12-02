// Firebase App Initialization
const firebaseConfig = {
    apiKey: "AIzaSyAfJTkqlU9Y5yhn_g_HQXS9dNfOQTIQg3w",
    authDomain: "habit-tracker-58ba9.firebaseapp.com",
    projectId: "habit-tracker-58ba9",
    storageBucket: "habit-tracker-58ba9.appspot.com",
    messagingSenderId: "974837325994",
    appId: "1:974837325994:web:ca99d56003fad33504b0d3"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// Outlive Tracker - app.js
const App = {
    user: null,
    userData: { profile: {}, logs: {} },
    unsubscribe: null, // To store the Firestore listener unsubscribe function

    init() {
        console.log("Outlive Tracker Initializing with Firebase...");
        this.cacheDOMElements();
        this.bindEventListeners();
        this.handleAuthStateChange();
    },

    cacheDOMElements() {
        // Auth
        this.authContainer = document.getElementById('auth-container');
        this.appContainer = document.getElementById('app-container');
        this.emailInput = document.getElementById('email-input');
        this.passwordInput = document.getElementById('password-input');
        this.loginBtn = document.getElementById('login-btn');
        this.signupBtn = document.getElementById('signup-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.userEmailDisplay = document.getElementById('user-email-display');

        // Profile
        this.weightInput = document.getElementById('weight-input');
        this.saveWeightBtn = document.getElementById('save-weight-btn');
        this.proteinDisplay = document.getElementById('protein-target-display');

        // Log Form
        this.logFormSection = document.getElementById('log-form-section');
        this.logFormToggle = document.getElementById('log-form-toggle');
        this.accordionIcon = document.getElementById('accordion-icon');
        this.dailyLogForm = document.getElementById('daily-log-form');
        this.logDateInput = document.getElementById('log-date');
        this.zone2Input = document.getElementById('zone2-input');
        this.zone5Input = document.getElementById('zone5-input');
        this.strengthInput = document.getElementById('strength-input');
        this.sleepInput = document.getElementById('sleep-input');
        this.alcoholInput = document.getElementById('alcohol-input');
        this.proteinInput = document.getElementById('protein-input');

        // History
        this.historyTableBody = document.getElementById('history-table-body');
        this.historyCardsContainer = document.getElementById('history-cards-container');
        
        // Progress
        this.zone2ProgressBar = document.getElementById('zone2-progress-bar');
        this.zone2ProgressText = document.getElementById('zone2-progress-text');
        this.strengthSummary = document.getElementById('strength-summary');
        this.sleepSummary = document.getElementById('sleep-summary');
        this.alcoholSummary = document.getElementById('alcohol-summary');
        
        // Notifications
        this.notificationBubble = document.getElementById('notification-bubble');
    },

    bindEventListeners() {
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.signupBtn.addEventListener('click', () => this.handleSignUp());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        this.saveWeightBtn.addEventListener('click', () => this.handleSaveProfile());
        this.dailyLogForm.addEventListener('submit', (e) => this.handleSaveLog(e));
        
        this.logFormToggle.addEventListener('click', () => UI.toggleAccordion());
        this.logDateInput.addEventListener('change', () => this.loadLogForDate(this.logDateInput.value));
        const historyClickHandler = (e) => {
            if (e.target.classList.contains('edit-btn')) {
                this.handleEditClick(e.target.dataset.date);
            }
        };
        this.historyTableBody.addEventListener('click', historyClickHandler);
        this.historyCardsContainer.addEventListener('click', historyClickHandler);
    },

    handleAuthStateChange() {
        auth.onAuthStateChanged(user => {
            if (user) {
                this.user = user;
                this.authContainer.classList.add('hidden');
                this.appContainer.classList.remove('hidden');
                this.userEmailDisplay.textContent = user.email;
                this.loadInitialData();
            } else {
                this.user = null;
                if (this.unsubscribe) this.unsubscribe(); // Detach Firestore listener
                this.authContainer.classList.remove('hidden');
                this.appContainer.classList.add('hidden');
                this.userEmailDisplay.textContent = "The Centenarian's Log";
            }
        });
    },

    handleLogin() {
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => UI.showNotification('Logged in successfully!'))
            .catch(error => UI.showNotification(error.message, 'error'));
    },

    handleSignUp() {
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => UI.showNotification('Signed up successfully!'))
            .catch(error => UI.showNotification(error.message, 'error'));
    },

    handleLogout() {
        auth.signOut().then(() => UI.showNotification('Logged out.'));
    },

    loadInitialData() {
        if (!this.user) return;
        
        // Set up a real-time listener for user data
        this.unsubscribe = Firestore.onUserDataSnapshot(this.user.uid, (data) => {
            this.userData = data || { profile: {}, logs: {} };
            const today = new Date().toISOString().split('T')[0];
            if (!this.logDateInput.value) {
                this.logDateInput.value = today;
            }
            this.loadLogForDate(this.logDateInput.value);
            this.updateVisualizations();
        });
    },
    
    loadLogForDate(date) {
        const logData = this.userData.logs ? this.userData.logs[date] : null;
        this.zone2Input.value = logData?.zone2 || '';
        this.zone5Input.value = logData?.zone5 || '';
        this.strengthInput.checked = logData?.strength || false;
        this.sleepInput.value = logData?.sleep || '';
        this.alcoholInput.checked = logData?.alcohol || false;
        this.proteinInput.checked = logData?.protein || false;
    },

    handleEditClick(date) {
        this.logDateInput.value = date;
        this.loadLogForDate(date);
        UI.openAccordion();
        this.logFormSection.scrollIntoView({ behavior: 'smooth' });
    },

    handleSaveProfile() {
        const weightKg = parseFloat(this.weightInput.value);
        if (isNaN(weightKg) || weightKg <= 0) {
            UI.showNotification("Please enter a valid weight.", "error");
            return;
        }
        Firestore.updateUserProfile(this.user.uid, { weightKg })
            .then(() => UI.showNotification("Profile saved!"))
            .catch(e => UI.showNotification("Error saving profile.", "error"));
    },

    handleSaveLog(event) {
        event.preventDefault();
        const date = this.logDateInput.value;
        if (!date) {
            UI.showNotification("Please select a date.", "error");
            return;
        }
        const logData = {
            zone2: parseFloat(this.zone2Input.value) || 0,
            zone5: parseFloat(this.zone5Input.value) || 0,
            strength: this.strengthInput.checked,
            sleep: parseFloat(this.sleepInput.value) || 0,
            alcohol: this.alcoholInput.checked,
            protein: this.proteinInput.checked,
        };
        Firestore.saveLog(this.user.uid, date, logData)
            .then(() => UI.showNotification(`Log for ${date} saved.`))
            .catch(e => UI.showNotification("Error saving log.", "error"));
    },

    updateVisualizations() {
        const profile = this.userData.profile || {};
        const logs = this.userData.logs || {};

        if (profile.weightKg) {
            this.weightInput.value = profile.weightKg;
            UI.displayProteinTarget(profile.weightKg);
        } else {
            UI.displayProteinTarget(null);
        }

        UI.renderHistory(logs);
        this.updateWeeklySummary(logs);
    },

    updateWeeklySummary(logs) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const firstDayOfWeek = new Date(today);
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);

        let zone2Total = 0, strengthSessions = 0, sleepTotal = 0, sleepDays = 0, alcoholFreeDays = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(firstDayOfWeek);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            const log = logs[dateString];
            if (log) {
                zone2Total += log.zone2;
                if (log.strength) strengthSessions++;
                if (log.sleep > 0) {
                    sleepTotal += log.sleep;
                    sleepDays++;
                }
                if (!log.alcohol) alcoholFreeDays++;
            }
        }
        const avgSleep = sleepDays > 0 ? (sleepTotal / sleepDays).toFixed(1) : "0.0";
        
        UI.updateProgressBar(zone2Total, 180);
        UI.renderSummary({ strengthSessions, avgSleep, alcoholFreeDays });
    }
};

const UI = {
    notificationTimeout: null,

    displayProteinTarget(weightKg) {
        App.proteinDisplay.textContent = (weightKg > 0) ? `${(weightKg * 1.6).toFixed(1)}g` : 'N/A';
    },

    toggleAccordion() {
        App.dailyLogForm.classList.toggle('hidden');
        App.accordionIcon.classList.toggle('rotate-180');
    },
    
    openAccordion() {
        if (App.dailyLogForm.classList.contains('hidden')) this.toggleAccordion();
    },

    renderHistory(logs) {
        const sortedDates = Object.keys(logs).sort((a, b) => new Date(b) - new Date(a));
        App.historyTableBody.innerHTML = '';
        App.historyCardsContainer.innerHTML = '';

        if (sortedDates.length === 0) {
            App.historyTableBody.innerHTML = `<tr><td colspan="8" class="text-center p-4 text-gray-500">No data logged yet.</td></tr>`;
            App.historyCardsContainer.innerHTML = `<p class="text-center p-4 text-gray-500">No data logged yet.</p>`;
            return;
        }

        for (const date of sortedDates) {
            const log = logs[date];
            const tick = '<span class="text-green-500">✔</span>', cross = '<span class="text-red-500">✖</span>';
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-800';
            row.innerHTML = `
                <td class="p-3">${date}</td> <td class="p-3">${log.zone2} min</td> <td class="p-3">${log.zone5} min</td>
                <td class="p-3 text-center">${log.strength ? tick : cross}</td> <td class="p-3">${log.sleep} hr</td>
                <td class="p-3 text-center">${log.alcohol ? cross : tick}</td> <td class="p-3 text-center">${log.protein ? tick : cross}</td>
                <td class="p-3"><button class="edit-btn text-blue-500 hover:underline" data-date="${date}">Edit</button></td>`;
            App.historyTableBody.appendChild(row);

            const card = document.createElement('div');
            card.className = 'bg-slate-800 rounded-lg p-4';
            card.innerHTML = `
                <div class="flex justify-between items-center mb-3"><p class="font-bold text-white">${date}</p><button class="edit-btn text-blue-500 hover:underline" data-date="${date}">Edit</button></div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <p class="text-gray-300"><strong class="font-medium text-white">Zone 2:</strong> ${log.zone2} min</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Zone 5:</strong> ${log.zone5} min</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Sleep:</strong> ${log.sleep} hr</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Strength:</strong> ${log.strength ? tick : cross}</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Alcohol:</strong> ${log.alcohol ? cross : tick}</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Protein:</strong> ${log.protein ? tick : cross}</p>
                </div>`;
            App.historyCardsContainer.appendChild(card);
        }
    },

    updateProgressBar(current, target) {
        const percentage = Math.min((current / target) * 100, 100);
        App.zone2ProgressBar.style.width = `${percentage}%`;
        App.zone2ProgressText.textContent = `${current} / ${target} min`;
    },

    renderSummary(stats) {
        App.strengthSummary.textContent = stats.strengthSessions;
        App.sleepSummary.textContent = stats.avgSleep;
        App.alcoholSummary.textContent = stats.alcoholFreeDays;
    },

    showNotification(message, type = 'success') {
        clearTimeout(this.notificationTimeout);
        const bubble = App.notificationBubble;
        bubble.textContent = message;
        bubble.className = 'fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300'; // Reset classes
        bubble.classList.add(type === 'error' ? 'bg-red-600' : 'bg-green-600');
        bubble.classList.remove('opacity-0');
        this.notificationTimeout = setTimeout(() => bubble.classList.add('opacity-0'), 3000);
    }
};

const Firestore = {
    getUserDocRef(uid) {
        return db.collection('users').doc(uid);
    },

    onUserDataSnapshot(uid, callback) {
        const docRef = this.getUserDocRef(uid);
        return docRef.onSnapshot(doc => {
            if (doc.exists) {
                callback(doc.data());
            } else {
                // If user document doesn't exist, create it.
                this.getUserDocRef(uid).set({ profile: {}, logs: {} })
                    .then(() => console.log("New user document created."))
                    .catch(e => console.error("Error creating user document", e));
                callback({ profile: {}, logs: {} });
            }
        }, error => {
            console.error("Error listening to user data:", error);
            UI.showNotification("Error fetching data.", "error");
        });
    },
    
    async updateUserProfile(uid, profileData) {
        const docRef = this.getUserDocRef(uid);
        return docRef.set({ profile: profileData }, { merge: true });
    },

    async saveLog(uid, date, logData) {
        const docRef = this.getUserDocRef(uid);
        // Use dot notation to update a specific field in a map
        return docRef.set({
            logs: {
                [date]: logData
            }
        }, { merge: true });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
