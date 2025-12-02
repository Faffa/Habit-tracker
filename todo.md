# Outlive Tracker - To-Do List

This file tracks the development tasks for the Outlive Tracker project.

### Phase 0: Project Setup
- [x] Create `persona.md`
- [x] Create `requirements.md`
- [x] Create `architecture.md`
- [x] Create and initialize `todo.md`

### Phase 1: Core MVP
- [ ] **Sub-phase 1.1: User Profile & Basic UI**
    - [ ] Create the basic `index.html` structure with a header and placeholders for UI sections.
    - [ ] Create `app.js` and link it to the HTML.
    - [ ] Implement the User Profile section in HTML (weight input and save button).
    - [ ] Implement the `Storage` module in `app.js` to save and retrieve the user's weight from LocalStorage.
    - [ ] Display the calculated protein target on the page.

- [ ] **Sub-phase 1.2: Daily Logging Form**
    - [ ] Create the HTML for the daily log form (accordion style).
    - [ ] Add all required input fields as specified in `requirements.md`.
    - [ ] Implement the event listener for form submission.
    - [ ] On submit, save the log data to LocalStorage using the `Storage` module, keyed by the current date.

- [ ] **Sub-phase 1.3: Data Display & Visualization**
    - [ ] Create the HTML structure for the historical data table.
    - [ ] Implement the `UI.renderTable()` function to populate the table with all logs from LocalStorage.
    - [ ] Create the HTML for the weekly Zone 2 progress bar.
    - [ ] Implement the logic to calculate total weekly Zone 2 minutes and update the progress bar via `UI.updateProgressBar()`.
    - [ ] Ensure the main `App.init()` function calls the rendering functions on page load to display existing data.

### Phase 2: Advanced Integration (Future)
- [ ] Implement Web Bluetooth heart rate monitoring.
- [ ] Refine exercise tracking by separating "Strength" and "Stability".

