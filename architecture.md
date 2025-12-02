# Architecture: Outlive Tracker

This document describes the technical architecture for the Outlive Tracker single-page application.

---

### 1. Core Technology
- **Application Type:** Single-Page Application (SPA).
- **Primary Language:** Vanilla JavaScript (ES6+). No frameworks will be used for the initial build to maintain simplicity.
- **Structure:** The entire application will be served from a single `index.html` file.
- **Styling:** Tailwind CSS will be included via its CDN link in the `<head>`. A dark-mode, "medical/hacker" theme will be implemented.

---

### 2. File Structure
The project will consist of two primary files:
- `index.html`: Contains the complete HTML document structure, including all UI elements (forms, tables, progress bars) and the link to the Tailwind CSS CDN.
- `app.js`: Contains all application logic, including UI manipulation, event handling, and communication with LocalStorage.

---

### 3. Data Storage
- **Mechanism:** The browser's `localStorage` API will be used for all data persistence. No backend database is required for the MVP.
- **Data Schema:** A single JSON object will be stored under the key `outliveApp`. This object will have two main properties:
    - `profile`: Stores user-specific data, e.g., `{ "weightKg": 80 }`.
    - `logs`: An object where each key is a date string in `YYYY-MM-DD` format, and the value is the daily log object, e.g., `{ "zone2": 45, "sleep": 7.5, ... }`.

**Example `localStorage.getItem('outliveApp')`:**
```json
{
  "profile": {
    "weightKg": 80
  },
  "logs": {
    "2025-12-01": {
      "zone2": 45,
      "zone5": 0,
      "strength": true,
      "sleep": 7.5,
      "alcohol": false,
      "protein": true
    },
    "2025-12-02": {
      "zone2": 60,
      "zone5": 10,
      "strength": false,
      "sleep": 8,
      "alcohol": false,
      "protein": true
    }
  }
}
```

---

### 4. JavaScript Code Architecture (`app.js`)
To maintain clarity, the code within `app.js` will be organized into logical modules using an Immediately Invoked Function Expression (IIFE) or simple object-based namespaces.

- **`Storage` Module:**
    - A set of functions dedicated to interacting with `localStorage`.
    - `getProfile()`, `saveProfile(profileData)`, `getLog(date)`, `saveLog(date, logData)`, `getAllLogs()`.
- **`UI` Module:**
    - Functions responsible for updating the DOM.
    - `renderTable(logs)`, `updateProgressBar(currentMinutes)`, `displayProteinTarget(targetGrams)`.
- **`App` / `Main` Controller:**
    - An initialization function `App.init()` that runs on `DOMContentLoaded`.
    - Binds all event listeners (e.g., form submissions, button clicks).
    - Orchestrates calls between the `Storage` and `UI` modules.
    - Contains the core business logic (e.g., calculating weekly Zone 2 minutes).

---

### 5. Future Expansion
- **Web Bluetooth:** A separate `bluetooth.js` module will be created in Phase 2 to encapsulate all Web Bluetooth API logic. It will be designed to communicate with the main `App` controller via events or callbacks.
- **Service Workers:** Could be added later for offline capabilities, but are not in scope for the MVP.
