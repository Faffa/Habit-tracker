# Project: Outlive Tracker (The Centenarian's Log)

## 1. Overview
A "Medicine 3.0" longevity dashboard based on Peter Attia's book "Outlive". It allows the user to track daily habits that correlate with lifespan and healthspan (Zone 2 cardio, Sleep, Nutrition).

## 2. Tech Stack
- **Core:** HTML5, Vanilla JavaScript.
- **Styling:** Tailwind CSS (via CDN) for a dark-mode, medical-grade aesthetic.
- **Storage:** LocalStorage (Browser-based, no backend required initially).
- **Hardware Integration:** Web Bluetooth API to connect with Xiaomi Smart Band 10 for real-time Heart Rate monitoring.

## 3. Business Requirements (Metrics)
The app tracks specific "Outlive" pillars:
1.  **Exercise:**
    - Zone 2 Cardio (Minutes). Target: >180 mins/week.
    - Zone 5 / VO2 Max (Minutes).
    - Strength/Stability Training (Boolean/Checkbox).
2.  **Recovery:**
    - Sleep Duration (Hours).
    - Alcohol Consumption (Boolean - visually flagged as negative).
3.  **Nutrition:**
    - Protein Target Hit (Boolean - >1.6g/kg).

## 4. UI/UX "Vibe"
- **Visuals:** Dark mode (Slate 900/800), clean typography, "Hacker/Medical" dashboard feel.
- **Key Elements:**
    - "Streak Counter" and Weekly Progress Bar at the top.
    - Accordion-style input form.
    - "Connect Watch" button using Web Bluetooth.
    - Historical Data Table with star-rating logic based on daily performance.

## 5. Current Status
We have a prototype single-file `index.html` that successfully renders the UI, handles form submission to LocalStorage, and includes the Web Bluetooth connection skeleton.