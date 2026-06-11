# Sales Saathi

**Sales Saathi** is an AI-powered sales execution platform and co-pilot designed for modern, data-driven revenue teams. It injects intelligence directly into your workflow, helping sales representatives prepare faster, personalize conversations, automate follow-ups, and close more deals.

## 🚀 Key Features

*   **AI Pre-Meeting Briefs:** Automatic dossiers aggregating CRM history, 10-K filings, and recent news minutes before every call.
*   **Smart Ice-Breakers:** Build immediate rapport using hyper-personalized hooks generated from prospect LinkedIn activity.
*   **Live AI Meeting Coach:** Real-time transcriptions analyze sentiment and surface battlecards instantly when prospects raise objections.
*   **AI Meeting Summaries:** Automated structured notes, MEDDPICC parsing, and action items pushed directly to your CRM.
*   **Follow-Up Automation:** Draft hyper-relevant next-step emails while you're still on the call, ready to hit send.
*   **AI Deal Risk Predictor:** Forecast pipeline health by parsing stakeholder engagement levels and historical BANT data.
*   **Relationship Intelligence:** Visualize power dynamics and unearth hidden mutual connections to multithread deals effectively.

## 🛠️ Technology Stack

*   **Frontend:** HTML5, Alpine.js (for reactive UI components and state management), Tailwind CSS (via CDN for styling), and Vanilla JavaScript.
*   **Backend & Database:** Supabase (PostgreSQL, Authentication, Row Level Security).
*   **Theme Management:** Custom dark/light mode engine (`theme-manager.js`).
*   **Authentication:** Supabase Auth with secure Email OTP flow and protected routes.

## 📁 Project Structure

*   **`/`**: Core HTML pages (`index.html`, `dashboard.html`, `pricing.html`, `features.html`, `auth.html`, `deal-risk-tracking.html`, etc.).
*   **`/js/` & `/src/`**: Core JavaScript modules for application logic, theme management, header rendering, and AI features.
*   **`/components/`**: Reusable UI components.
*   **`/supabase/`**: Supabase configuration and database schema definitions.
*   **`/scripts/` & `*.cjs`**: Utility scripts for build steps, link updates, and UI hotfixes.

## ⚙️ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed to run any local server or build scripts, and a [Supabase](https://supabase.com/) project set up.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/salessaathi.git
    cd salessaathi
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Locally:**
    You can use any local web server to serve the HTML files. For example, using `npx`:
    ```bash
    npx serve .
    ```
    Alternatively, if using an extension like Live Server in VS Code, simply open `index.html` and start the server.

## 🔒 Authentication & Subscriptions

Sales Saathi uses a centralized authentication architecture via Supabase. It includes:
*   Email OTP verification for seamless onboarding.
*   Route guards to protect premium features (`dashboard.html`, `deal-risk-tracking.html`).
*   Subscription-based feature gating (Free, Pro, Team, Enterprise tiers) integrated into the core user experience.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## 📄 License

This project is licensed under the ISC License.
