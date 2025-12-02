# Requirements: Outlive Tracker MVP (Phase 1)

This document outlines the minimum viable product requirements based on the "Outlive" framework.

---

### 1.0 User Profile
The application must allow a user to configure their personal data required for metric calculations.

- **1.1. Weight Configuration:** The user MUST be able to input their body weight in kilograms.
- **1.2. Data Persistence:** The weight information MUST be saved to the browser's LocalStorage and loaded automatically on subsequent visits.

---

### 2.0 Daily Metric Logging
The core feature of the application is logging daily activities.

- **2.1. Logging Form:** The UI MUST present a clear form for logging data for a specific date. An accordion-style UI is preferred.
- **2.2. Loggable Metrics:** The form MUST include the following fields:
    - **Zone 2 Cardio:** Input for minutes (number).
    - **Zone 5 / VO2 Max:** Input for minutes (number).
    - **Strength Training:** A single checkbox (boolean).
    - **Sleep Duration:** Input for hours (number).
    - **Alcohol Consumption:** A single checkbox (boolean, where `true` indicates consumption).
    - **Protein Target Met:** A single checkbox (boolean).
- **2.3. Protein Target Helper:** To assist the user, the UI MUST display the calculated daily protein target in grams. This is calculated as `user_weight_kg * 1.6`.

---

### 3.0 Data Persistence and Visualization
Logged data must be stored and presented back to the user to encourage progress.

- **3.1. Log Storage:** All daily log entries MUST be saved to LocalStorage, indexed by date (e.g., `YYYY-MM-DD`).
- **3.2. Historical View:** A table or list MUST display all past log entries, showing the date and the data for each metric.
- **3.3. Weekly Progress Bar:** The UI MUST feature a prominent progress bar that displays the cumulative Zone 2 minutes for the current week, visually tracking progress towards the 180-minute weekly goal.

---
