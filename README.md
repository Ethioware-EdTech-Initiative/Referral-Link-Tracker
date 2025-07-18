# ALX Ethiopia Referral Link Tracker

![Ethioware Logo](https://ethioware.org/assets/img/logo-mini.png)
![ALX Logo](https://ethiopia.alxafrica.com/wp-content/uploads/2025/02/logo-city-ethiopia.svg)

## Welcome Interns!

Welcome to the ALX Ethiopia Referral Link Tracker project, an initiative by Ethioware EdTech! This document will serve as your guide to get started. Please read it carefully to understand the project's goals, structure, and how you can contribute effectively.

**Project Manager:** Anteneh Yimmam

---

## Table of Contents

- [About The Project](#about-the-project)
- [Project Objectives](#project-objectives)
- [Key Deliverables (Beta v1.0)](#key-deliverables-beta-v10)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)

---

## About The Project

Currently, tracking the specific impact of individual recruitment officers on ALX Ethiopia program sign-ups is a manual and often inaccurate process. This project aims to introduce a robust, data-driven system to precisely measure the performance of each officer. We will develop and implement a system that generates unique referral links, tracks sign-ups from these links, and automates reporting to measure recruitment effectiveness accurately.

---

## Project Objectives

Our primary goal is to deliver a functional beta version of the tracking platform within 2 months. The key objectives are:

1.  **Generate Unique URLs:** Develop a tool to generate a unique, trackable URL for each recruitment officer.
2.  **Attribute Sign-ups:** Implement a tracking system to accurately attribute completed sign-ups to the corresponding referral link.
3.  **Real-time Dashboard:** Create a dashboard to display real-time sign-up counts for each recruitment officer.
4.  **Automate Reporting:** Automate the export of referral data to a shared Google Sheet for transparent reporting and analysis.

---

## Key Deliverables (Beta v1.0)

The beta version will include the following deliverables:

-   **Referral Link Generator:** A functional, secure tool for administrators.
-   **Live Tracking Dashboard:** A dashboard displaying sign-ups per officer, updated in real-time.
-   **Automated Data Pipeline:** A pipeline that syncs tracking data to a designated Google Sheet daily.
-   **User Documentation:** Clear guides for recruitment officers on how to use their unique links.
-   **Technical Documentation:** Complete documentation for system maintenance and future development.

---

## Tech Stack

The technology stack for this project must integrate with the existing website infrastructure. The specific stack will be finalized during the planning phase.

* **Frontend:** `[To be decided by the team - for admin dashboard and testing pages]`
* **Backend:** `[To be decided by the team - for link generation and data aggregation]`
* **Database:** `[To be decided by the team]`
* **Automation/API:** Google Sheets API
* **Version Control:** Git / GitHub
* **Deployment:** `[To be decided by the team - likely an Ethioware subdomain]`

---

## Getting Started

To get a local copy up and running, please follow these steps.

### Prerequisites

Make sure you have the following software installed on your machine:

* **Git:** To clone the repository and manage versions.
* `[Add any other prerequisites here, like Node.js, Python, Docker, etc., once decided]`

### Installation

1.  **Clone the repo:**
    ```sh
    git clone [repository-url]
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd alx-referral-tracker
    ```
3.  **Install dependencies:**
    * Follow the instructions specific to the chosen frontend and backend stacks.
        ```sh
        # Example for a Node.js project
        npm install
        ```
4.  **Set up environment variables:**
    * Create a `.env` file in the relevant directories (e.g., `backend`).
    * Copy the contents from `.env.example` and fill in the required keys (e.g., database connection strings, Google API credentials, etc.). Your team lead will provide these.

5.  **Run the development server:**
    * Follow the instructions specific to the chosen stack.
        ```sh
        # Example for a Node.js project
        npm run dev
        ```

---

## How to Contribute

We encourage a collaborative and open environment. To ensure a smooth workflow, please adhere to the following contribution guidelines:

1.  **Create a Feature Branch:** Before you start working on a new feature or bug fix, create a new branch from the `develop` branch.
    ```sh
    git checkout develop
    git pull origin develop
    git checkout -b feature/YourAmazingFeature
    ```
2.  **Commit Your Changes:** Make your changes and commit them with a clear and descriptive message.
    ```sh
    git commit -m "feat: Implement amazing new feature"
    ```
    *(We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.)*

3.  **Push to Your Branch:**
    ```sh
    git push origin feature/YourAmazingFeature
    ```
4.  **Open a Pull Request (PR):** Go to the GitHub repository and open a new Pull Request from your feature branch to the `develop` branch.
    * Fill out the PR template with details about your changes.
    * Assign a reviewer (usually the Team Lead or another intern).

Your code will be reviewed, and once approved, it will be merged into the `develop` branch.
