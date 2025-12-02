// Outlive Tracker - app.js

const App = {
    init() {
        console.log("Outlive Tracker Initialized.");
        this.cacheDOMElements();
        this.bindEventListeners();
        this.loadInitialData();
    },

    cacheDOMElements() {
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
        this.saveWeightBtn.addEventListener('click', () => this.handleSaveProfile());
        this.logFormToggle.addEventListener('click', () => UI.toggleAccordion());
        this.dailyLogForm.addEventListener('submit', (e) => this.handleSaveLog(e));
        this.logDateInput.addEventListener('change', () => this.loadLogForDate(this.logDateInput.value));
        
        const historyClickHandler = (e) => {
            if (e.target.classList.contains('edit-btn')) {
                this.handleEditClick(e.target.dataset.date);
            }
        };
        this.historyTableBody.addEventListener('click', historyClickHandler);
        this.historyCardsContainer.addEventListener('click', historyClickHandler);
    },

    loadInitialData() {
        // Load Profile
        const profile = Storage.getProfile();
        if (profile && profile.weightKg) {
            this.weightInput.value = profile.weightKg;
            UI.displayProteinTarget(profile.weightKg);
        }

        // Set date to today and load today's log if it exists
        const today = new Date().toISOString().split('T')[0];
        this.logDateInput.value = today;
        this.loadLogForDate(today);

        // Render initial data
        this.updateVisualizations();
    },
    
    loadLogForDate(date) {
        const logData = Storage.getLog(date);
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

        Storage.saveProfile({ weightKg });
        UI.displayProteinTarget(weightKg);
        UI.showNotification("Profile saved!");
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

        Storage.saveLog(date, logData);
        UI.showNotification(`Log for ${date} saved.`);
        
        this.updateVisualizations();
    },

    updateVisualizations() {
        UI.renderHistory();
        this.updateWeeklySummary();
    },

    updateWeeklySummary() {
        const logs = Storage.getAllLogs();
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
        const firstDayOfWeek = new Date(today);
        // Adjust to make Monday the first day of the week
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);

        let zone2Total = 0;
        let strengthSessions = 0;
        let sleepTotal = 0;
        let sleepDays = 0;
        let alcoholFreeDays = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(firstDayOfWeek);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            const log = logs[dateString];
            if (log) {
                zone2Total += log.zone2;
                if(log.strength) strengthSessions++;
                if(log.sleep > 0) {
                    sleepTotal += log.sleep;
                    sleepDays++;
                }
                if(!log.alcohol) alcoholFreeDays++;
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
        if (!App.proteinDisplay) App.cacheDOMElements();
        if (weightKg && weightKg > 0) {
            const target = (weightKg * 1.6).toFixed(1);
            App.proteinDisplay.textContent = `${target}g`;
        } else {
            App.proteinDisplay.textContent = 'N/A';
        }
    },

    toggleAccordion() {
        App.dailyLogForm.classList.toggle('hidden');
        App.accordionIcon.classList.toggle('rotate-180');
    },
    
    openAccordion() {
        if (App.dailyLogForm.classList.contains('hidden')) {
            this.toggleAccordion();
        }
    },

    renderHistory() {
        if (!App.historyTableBody) App.cacheDOMElements();

        const logs = Storage.getAllLogs();
        const sortedDates = Object.keys(logs).sort((a, b) => new Date(b) - new Date(a));

        App.historyTableBody.innerHTML = '';
        App.historyCardsContainer.innerHTML = '';

        if (sortedDates.length === 0) {
            const placeholder = `<tr><td colspan="8" class="text-center p-4 text-gray-500">No data logged yet.</td></tr>`;
            App.historyTableBody.innerHTML = placeholder;
            App.historyCardsContainer.innerHTML = `<p class="text-center p-4 text-gray-500">No data logged yet.</p>`;
            return;
        }

        for (const date of sortedDates) {
            const log = logs[date];
            const tick = '<span class="text-green-500">✔</span>';
            const cross = '<span class="text-red-500">✖</span>';

            // Create Table Row
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-800';
            row.innerHTML = `
                <td class="p-3">${date}</td>
                <td class="p-3">${log.zone2} min</td>
                <td class="p-3">${log.zone5} min</td>
                <td class="p-3 text-center">${log.strength ? tick : cross}</td>
                <td class="p-3">${log.sleep} hr</td>
                <td class="p-3 text-center">${log.alcohol ? cross : tick}</td>
                <td class="p-3 text-center">${log.protein ? tick : cross}</td>
                <td class="p-3">
                    <button class="edit-btn text-blue-500 hover:underline" data-date="${date}">Edit</button>
                </td>
            `;
            App.historyTableBody.appendChild(row);

            // Create Mobile Card
            const card = document.createElement('div');
            card.className = 'bg-slate-800 rounded-lg p-4';
            card.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <p class="font-bold text-white">${date}</p>
                    <button class="edit-btn text-blue-500 hover:underline" data-date="${date}">Edit</button>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <p class="text-gray-300"><strong class="font-medium text-white">Zone 2:</strong> ${log.zone2} min</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Zone 5:</strong> ${log.zone5} min</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Sleep:</strong> ${log.sleep} hr</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Strength:</strong> ${log.strength ? tick : cross}</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Alcohol:</strong> ${log.alcohol ? cross : tick}</p>
                    <p class="text-gray-300"><strong class="font-medium text-white">Protein:</strong> ${log.protein ? tick : cross}</p>
                </div>
            `;
            App.historyCardsContainer.appendChild(card);
        }
    },

    updateProgressBar(current, target) {
        if (!App.zone2ProgressBar) App.cacheDOMElements();

        const percentage = Math.min((current / target) * 100, 100);
        App.zone2ProgressBar.style.width = `${percentage}%`;
        App.zone2ProgressText.textContent = `${current} / ${target} min`;
    },

    renderSummary(stats) {
        if (!App.strengthSummary) App.cacheDOMElements();
        App.strengthSummary.textContent = stats.strengthSessions;
        App.sleepSummary.textContent = stats.avgSleep;
        App.alcoholSummary.textContent = stats.alcoholFreeDays;
    },

    showNotification(message, type = 'success') {
        if (!App.notificationBubble) App.cacheDOMElements();
        
        clearTimeout(this.notificationTimeout);

        const bubble = App.notificationBubble;
        bubble.textContent = message;
        bubble.classList.remove('bg-green-600', 'bg-red-600', 'opacity-0');
        
        if (type === 'success') {
            bubble.classList.add('bg-green-600');
        } else if (type === 'error') {
            bubble.classList.add('bg-red-600');
        }
        
        bubble.classList.remove('opacity-0');

        this.notificationTimeout = setTimeout(() => {
            bubble.classList.add('opacity-0');
        }, 3000);
    }
};

const Storage = {
    STORAGE_KEY: 'outliveApp',

    _getAppData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : { profile: {}, logs: {} };
        } catch (e) {
            console.error("Error reading from localStorage", e);
            return { profile: {}, logs: {} };
        }
    },

    _saveAppData(appData) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appData));
        } catch (e) {
            console.error("Error writing to localStorage", e);
        }
    },

    getProfile() {
        const appData = this._getAppData();
        return appData.profile;
    },

    saveProfile(profileData) {
        const appData = this._getAppData();
        appData.profile = { ...appData.profile, ...profileData };
        this._saveAppData(appData);
    },

    getLog(date) {
        const appData = this._getAppData();
        return appData.logs[date];
    },

    saveLog(date, logData) {
        const appData = this._getAppData();
        appData.logs[date] = logData;
        this._saveAppData(appData);
    },

    getAllLogs() {
        const appData = this._getAppData();
        return appData.logs;
    }
};


document.addEventListener('DOMContentLoaded', () => App.init());
