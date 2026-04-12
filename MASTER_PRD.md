# ExamTracker Master Blueprint & Execution Roadmap

## 1. Product Vision & Overview

### The Core Problem
Most competitive exam aspirants rely on scattered PDFs, physical notebooks, or generalized to-do apps to track their massive syllabuses. These methods lack structured progress tracking, are prone to getting lost, and fail to provide absolute clarity on what has been studied versus what needs urgent revision.

### The Solution: ExamTracker
ExamTracker is a hyper-focused, distraction-free, offline-first syllabus tracking application designed explicitly for students and aspirants. It allows users to structurally track their syllabus completion with absolute visual clarity. By persisting data directly in the device's LocalStorage, ExamTracker offers instantaneous load times, zero reliance on active network connections for daily studying, and guaranteed data privacy.

---

## 2. Target Audience

ExamTracker serves a dedicated demographic of highly focused learners:
* **Competitive Exam Aspirants:** Specifically targeting structured government and standardized exams such as RRB NTPC, UP Police SI, SSC CGL/CHSL, UPSC CSE, and various State Public Service Commissions (PSCs).
* **University Students:** Students preparing for rigorous semester exams or specialized entrance tests (JEE Main, NEET) requiring strict structural tracking of textbooks and topics.
* **Self-Learners:** Individuals undertaking large-scale, categorized self-study subjects over extended periods.

---

## 3. Core Mechanics & UI/UX

### Infinite Nested Hierarchy
The application structures syllabuses in an infinitely scalable nested tree format, defaulting to the following semantic structure:
1. **Exam:** Absolute top level (e.g., UP Police SI).
2. **Subject:** Core categories (e.g., Mathematics, General Hindi).
3. **Topic:** Sub-categories (e.g., Number System).
4. **Subtopic:** Granular, actionable study items (e.g., Prime Numbers, Divisibility Rules). Note: The architecture supports infinitely recursive sub-subtopics.

### Tri-State Progress System
Every actionable subtopic features a strict 3-stage progress timeline to ensure robust learning:
- **Read:** Checked off when the student has read the material.
- **Practiced:** Checked off after solving MCQs or writing practice answers.
- **Revised:** Final check-off after a secondary review, turning the item green and marking it completely conquered.

### Offline-First Architecture
The entire UX is designed to function with zero internet dependency (post-initial load). All user progress, imported schemas, and theme settings are rapidly synchronized with browser/device `LocalStorage`. 

---

## 4. Technical Stack

The architecture is built on the bleeding-edge modern React ecosystem, tuned for high performance and seamless mobile convertibility:

* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Language:** TypeScript (Strict typing for robust state and properties)
* **Styling:** Tailwind CSS v4 (Utility-first, heavily customized with CSS variables for dynamic theming)
* **State Management:** Zustand (Integrated with `persist` middleware to automatically dump the application state tree to LocalStorage seamlessly)
* **Mobile Packaging:** Ionic Capacitor (Used to wrap the Next.js static export into native iOS and Android bundles without rewriting logic in React Native)

---

## 5. Data Architecture & Scalability

We have engineered a modular backend data system to ensure the client bundle never bloats, regardless of how many exams we support.

### The `src/data/syllabusLibrary/` Structure
* **Dynamic Modules:** Every exam template is isolated into its own JSON file (e.g., `upsc_cse_prelims_2026.json`, `rrb_ntpc.json`).
* **Central Indexing:** An auto-generated `index.ts` file acts as the primary registry. It exports a lightweight `availableExams` summary array (containing only `id`, `title`, `totalSubjects`, etc.).
* **Lazy Loading Strategy:** When the user clicks the "Import Official Syllabus" button, the modal instantly renders using the `index.ts` array. Upon selecting an exam, Webpack recursively fires an asynchronous dynamic import (`await import('@/data/syllabusLibrary/[examId].json')`), pulling the 100kb+ payload over the network *only* when strictly necessary. 

---

## 6. Step-by-Step Execution Roadmap

### Phase 1: Frontend MVP & Persistence (Completed)
- **UI/UX Polish:** Deployed dynamic dark mode, micro-animations, glassmorphism aesthetics, and the master nested accordion system.
- **State Engine:** Architected the complete CRUD (Create, Read, Update, Delete) capability for exams, subjects, topics, and recursive subtopics using Zustand.
- **Data Modularity:** Shifted from a single monolithic JSON file to isolated, dynamically loaded JSON templates for unmatched scalability.

### Phase 2: Mobile Transformation (Current Phase)
The objective is to turn the responsive web app into a native Android app via Ionic Capacitor.
1. Add `@capacitor/core` and `@capacitor/cli` to the project.
2. Initialize Capacitor: `npx cap init ExamTracker com.yourname.examtracker`.
3. Configure `next.config.mjs` to output a static export (`output: 'export'`).
4. Build the static payload: `npm run build`.
5. Install Android dependencies: `npm install @capacitor/android`.
6. Add the Android platform: `npx cap add android`.
7. Sync assets: `npx cap copy android`.
8. Open the native project shell: `npx cap open android` (launches Android Studio).

### Phase 3: Testing & QA
- Establish local emulators within Android Studio (Pixel 7 / Android 14).
- Verify `LocalStorage` persistence behaving correctly within the Android WebView instance.
- Ensure tap targets and swipe gestures do not conflict with the native Android back-gesture controls.
- Generate a standalone Debug APK (`Build > Build Bundle(s) / APK(s) > Build APK(s)`) and side-load it onto physical mid-range devices to test CPU limits and load speeds.

### Phase 4: Google Play Store Deployment
- **Account Setup:** Register a Google Play Developer account ($25 one-time fee) and complete identity verification.
- **Initial Testing Track:** Push the initial debug/alpha versions to the Internal Testing track.
- **The 20-Tester Policy:** If required by current Google Play policies for new developers, run a 14-day Closed Testing phase with 20 distinct users interacting with the app.
- **Production Asset Generation:** Generate the signed `.aab` (Android App Bundle) via Android Studio with a securely stored keystore.
- **Store Listing:** Curate the store presence with high-quality screenshots, an engaging promotional video, privacy policy linkage, and targeted ASO (App Store Optimization) keywords.

---

## 7. Future Scope & Monetization (Phase 5)

While current architecture focuses strictly on privacy and isolated offline capabilities, the eventual roadmap scales into a SaaS-lite model:

### Advanced Technological Expansions
- **Cloud Sync Integration:** Implement Firebase or Supabase to allow real-time database synchronization. If the user clears their phone cache or logs into a new tablet, their progress securely synchronizes over the air.
- **Cross-Device Authentication:** Implementation of Google/Apple OAuth logic enabling seamless identity access.
- **Advanced Gamification:** Include streak counters, visually rich analytics dashboards graphing weekly study throughput, and AI-predicted exam readiness percentages.

### Freemium Business Model
- **Core Tier (Free):** Users retain the current unrestricted ability to manually create their own syllabus structures and access robust, absolute tracking features completely free, subsidized by minimal banner ads or entirely ad-free.
- **Premium Tier (Paid via IAP - $0.99-$2.99 / m):**
  - Instant access to premium, strictly vetted, and frequently updated 100+ official exam syllabus templates.
  - Unlimited cloud synchronization & multidevice support.
  - Deep analytics export options.
  - Access to community-uploaded, shared public syllabus libraries.
