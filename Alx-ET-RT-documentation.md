[![Preview](https://i.ibb.co/4R4kKyfn/1721195531703.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)

# ALX Recruitment Tracker - Documentation

## Table of Contents

### Document Metadata
- [0.1 Project Title](#01-project-title)
- [0.2 Version & Date](#02-version--date)
- [0.3 Document Owner & Contributors](#03-document-owner--contributors)
- [0.4 Revision History](#04-revision-history)

### Part I — General Overview
- [1. Executive Summary](#1-executive-summary)
  - [1.1 Business Context & Problem Statement](#11-business-context--problem-statement)
  - [1.2 Project Objectives & Success Criteria](#12-project-objectives--success-criteria)
  - [1.3 Scope](#13-scope)
  - [1.4 High-Level Solution Overview](#14-high-level-solution-overview)
- [2. Stakeholders & Governance](#2-stakeholders--governance)
  - [2.1 Stakeholder Map](#21-stakeholder-map)
  - [2.2 Roles & Responsibilities (RBAC Overview)](#22-roles--responsibilities-rbac-overview)
  - [2.3 Decision-Making & Change Management Process](#23-decision-making--change-management-process)
  - [2.4 RACI Chart](#24-raci-chart)
- [3. Business Requirements](#3-business-requirements)
  - [3.1 Functional Requirements](#31-functional-requirements)
  - [3.2 KPIs & Measurement Plan](#32-kpis--measurement-plan)
  - [3.3 Non-Functional Requirements](#33-non-functional-requirements)
- [4. Product & UX Overview](#4-product--ux-overview)
  - [4.1 Primary User Flows](#41-primary-user-flows)
  - [4.2 Key Screens](#42-key-screens)
  - [4.3 Accessibility & Internationalization Guidelines](#43-accessibility--internationalization-guidelines)
- [5. System Architecture (End-to-End)](#5-system-architecture-end-to-end)
  - [5.1 Context Diagram & Data Flow](#51-context-diagram--data-flow)
  - [5.2 High-Level Components](#52-high-level-components)
  - [5.3 Deployment Topology & Environment Segregation](#53-deployment-topology--environment-segregation)

### Part II — Frontend Documentation (Next.js)
- [6. Tech Stack & Key Design Decisions](#6-tech-stack--key-design-decisions)
  - [6.1 Core Technologies](#61-core-technologies)
  - [6.2 Critical Architecture Choices](#62-critical-architecture-choices)
  - [6.3 Route Protection Matrix](#63-route-protection-matrix)
  - [6.4 Login Sequence](#64-login-sequence)
  - [6.5 Session Maintenance](#65-session-maintenance)
  - [6.6 Fetching Patterns](#66-fetching-patterns)
  - [6.7 Error Handling](#67-error-handling)
  - [6.8 Link Generation](#68-link-generation)
  - [6.9 Attribution Tracking](#69-attribution-tracking)
  - [6.10 Core Protocols](#610-core-protocols)
  - [6.11 Data Privacy](#611-data-privacy)
  - [6.12 Validation Layers](#612-validation-layers)
- [7. Architecture & Folder Structure](#7-architecture--folder-structure)
- [8. Authentication Flow](#8-authentication-flow)
- [9. Data Handling Strategy](#9-data-handling-strategy)
- [10. Key Functional Modules](#10-key-functional-modules)
- [11. Security Implementation](#11-security-implementation)
- [12. Testing Approach](#12-testing-approach)
- [13. Implementation Timeline](#13-implementation-timeline)
- [14. Handover Notes](#14-handover-notes)

### Part III — Backend Documentation (Django/DRF)
- [15. Tech Stack & Service Overview](#15-tech-stack--service-overview)
  - [15.1 Django REST Framework & Supporting Services](#151-django-rest-framework--supporting-services)
  - [15.2 Justification for Tech Choices](#152-justification-for-tech-choices)
- [16. Modular Django Apps Structure](#16-modular-django-apps-structure)
- [17. Models & Database Schema](#17-models--database-schema)
- [18. Core Functional Flows](#18-core-functional-flows)
  - [18.1 Referral Code Creation Process](#181-referral-code-creation-process)
  - [18.2 Click Tracking Flow](#182-click-tracking-flow)
  - [18.3 Signup Tracking Flow](#183-signup-tracking-flow)
  - [18.4 Data Aggregation & Export Flow](#184-data-aggregation--export-flow)
- [19. Authentication & Authorization](#19-authentication--authorization)
  - [19.1 JWT Authentication](#191-jwt-authentication)
  - [19.2 DRF Permission Classes](#192-drf-permission-classes)
  - [19.3 Role-Based Access](#193-role-based-access)
- [20. Performance Optimization & Caching](#20-performance-optimization--caching)
  - [20.1 Redis Caching Strategy](#201-redis-caching-strategy)
- [21. Background Tasks & Scheduling](#21-background-tasks--scheduling)
  - [21.1 Celery Worker Setup](#211-celery-worker-setup)
  - [21.2 Export Job Flow](#212-export-job-flow)
  - [21.3 Retry & Error Handling Policies](#213-retry--error-handling-policies)
  - [21.4 Monitoring & Visibility](#214-monitoring--visibility)
- [22. Error Handling](#22-error-handling)
  - [22.1 Centralized Exception Handling](#221-centralized-exception-handling)
- [23. API Documentation Generation](#23-api-documentation-generation)
  - [23.1 django-spectacular Setup](#231-django-spectacular-setup)
  - [23.2 API Consistency](#232-api-consistency)
- [24. Testing & Quality Assurance](#24-testing--quality-assurance)
  - [24.1 Unit & Integration Testing](#241-unit--integration-testing)
  - [24.2 Performance & Load Testing](#242-performance--load-testing)
  - [24.3 Background Worker Reliability](#243-background-worker-reliability)
  - [24.4 Deployment & Server Validation](#244-deployment--server-validation)
  - [24.5 Reporting & Artifacts](#245-reporting--artifacts)
- [25. Execution Plan by Phases (Backend)](#25-execution-plan-by-phases-backend)

### Part IV — Shared API Specification
- [26. API Standards & Guidelines](#26-api-standards--guidelines)
- [27. Authentication & Session Flow](#27-authentication--session-flow)
- [28. RBAC in APIs](#28-rbac-in-apis)
- [29. Endpoint Catalog (High-Level)](#29-endpoint-catalog-high-level)
- [30. Tracking API Details](#30-tracking-api-details)
- [31. API Performance & Limits](#31-api-performance--limits)

### Part V — Data & Analytics Documentation
- [32. Metrics Catalog & KPI Definitions](#32-metrics-catalog--kpi-definitions)
  - [32.1 Core Performance Metrics](#321-core-performance-metrics)
  - [32.2 Conversion & Efficiency KPIs](#322-conversion--efficiency-kpis)
  - [32.3 Officer & Campaign KPIs](#323-officer--campaign-kpis)
  - [32.4 Time-Based KPIs](#324-time-based-kpis)
  - [32.5 Security & Fraud KPIs](#325-security--fraud-kpis)
- [33. Data Models & Event Schema](#33-data-models--event-schema)
  - [33.1 Click Event Schema](#331-click-event-schema)
  - [33.2 Signup Event Schema](#332-signup-event-schema)
- [34. Dashboards](#34-dashboards)
  - [34.1 Admin Dashboard](#341-admin-dashboard)
  - [34.2 Officer Dashboard](#342-officer-dashboard)
- [35. Advanced Insights & Analysis](#35-advanced-insights--analysis)
  - [35.1 Cross-Campaign Officer Performance](#351-cross-campaign-officer-performance)
  - [35.2 Conversion Time Distribution](#352-conversion-time-distribution)
  - [35.3 Fraud Risk Analysis](#353-fraud-risk-analysis)
- [36. Reporting & Exports](#36-reporting--exports)
  - [36.1 Google Sheets Structure](#361-google-sheets-structure)
  - [36.2 Automation Schedule](#362-automation-schedule)
- [37. Data Governance & Quality](#37-data-governance--quality)
  - [37.1 Validation Rules](#371-validation-rules)

### Part VI — Operations & Maintenance
- [38. Security, Privacy & Compliance](#38-security-privacy--compliance)
  - [38.1 Threat Model & Risks](#381-threat-model--risks)
  - [38.2 Security Controls](#382-security-controls)
- [39. Performance & Reliability](#39-performance--reliability)
  - [39.1 Load Testing](#391-load-testing)
- [40. Testing & Quality Assurance (Cross-Team)](#40-testing--quality-assurance-cross-team)
  - [40.1 Test Pyramid](#401-test-pyramid)
- [41. DevOps & Deployment (Cross-Team)](#41-devops--deployment-cross-team)
  - [41.1 Environment Matrix](#411-environment-matrix)

### Part VII — Appendices
- [42. References & Linked Documents](#42-references--linked-documents)

<div style="page-break-before: always;"></div>

## 0. Document Metadata

**0.1 Project Title**  
**ALX Recruitment Tracker** — A system to manage recruitment campaigns, track referral link performance, and provide data-driven insights for decision-making.

**0.2 Version & Date**  

**Version**: 1.0.0
**Date**: 8/15/2025

**0.3 Document Owner & Contributors**

- **Product Manager** (**Anteneh Yimmam** ) – Oversees overall project requirements and delivery.
    
- **Frontend Team** (**Abdullah Aftab, Yonas Andualem**) – Responsible for UI/UX, Next.js implementation, and client-side integration.
    
- **Backend Team** (**Nahom Merga, Tsiyon Gashaw**) – Responsible for API development, business logic, and integrations using Django/DRF.
    
- **Data Analytics Team** (**Birkity Yishak**)  – Responsible for metrics definitions, dashboards, and reports.
    

**0.4 Revision History**

| Version | Date      | Author / Editor | Changes Made                        |
| ------- | --------- | --------------- | ----------------------------------- |
| 1.0     | 8/15/2025 | NAHOM MERGA     | Initial unified documentation draft |
| 1.1     | 9/27/2025 | NAHOM MERGA     | updated backend  section            |
|         |           |                 |                                     |

## **Part I — General Overview**

### 1. Executive Summary

**1.1 Business Context & Problem Statement**  
The ALX Recruitment Tracker addresses the need to streamline and monitor recruitment campaigns run by officers. The process involves generating secure referral links for officers, tracking clicks and signups, and providing real-time performance data. Without a centralized tool, tracking officer contributions, detecting fraudulent activities, and optimizing campaigns becomes inefficient and prone to errors.

**1.2 Project Objectives & Success Criteria**

- **Objectives**:
    
    - Enable administrators to create and manage recruitment campaigns.
        
    - Provide officers with personalized referral links for tracking performance.
        
    - Offer real-time dashboards for both admins and officers to monitor recruitment progress.
        
    - Export performance data to Google Sheets for reporting and analysis.
        
    - implement fraud detection and prevention mechanisms.
        
- **Success Criteria**:
    
    - Accurate attribution of signups to officers and campaigns.
        
    - Low latency in updating click and signup data.
        
    - High system availability and reliability.
        
    - User-friendly dashboards for both technical and non-technical users.
        

**1.3 Scope**

- **In-Scope**:
    
    - Referral link generation and tracking (clicks, signups).
        
    - Real-time statistics dashboards.
        
    - Exporting aggregated data to Google Sheets.
        
    - Fraud detection logic based on click and signup patterns.
        
    - Role-based access control (Admin, Officer).
        
        
**1.4 High-Level Solution Overview**  

The system consists of:

- **Frontend (Next.js)** — Provides web-based dashboards for admins and officers, supports secure authentication, and fetches data from backend APIs.
    
- **Backend (Django/DRF)** — Manages business logic, referral link generation, tracking, and data aggregation. Integrates with external APIs such as Google Sheets for exporting reports.
    
- **Data & Analytics Layer** — Defines KPIs, processes event data, and powers dashboards for performance insights.
    
- **Security & Compliance** — Ensures data privacy, protects against fraudulent activity, and enforces RBAC.
    

### 2. Stakeholders & Governance

**2.1 Stakeholder Map**

- **Admin** – Creates campaigns, manages officers, and oversees recruitment performance.
    
- **Officer** – Generates referral links, promotes campaigns, and tracks personal performance.
    
- **Engineering Teams** – Frontend, backend, and analytics teams implementing the system.


**2.2 Roles & Responsibilities (RBAC Overview)**

- **SUPER_ADMIN (Admin)**:
    
    - Full access to manage officers, campaigns, and referral links.
        
    - View all dashboards and exports.
        
- **OFFICER**:
    
    - View only their own campaign statistics.
        
    - Access personal referral link history and reports.
        

**2.3 Decision-Making & Change Management Process**

- Major feature requests and architectural changes require approval from the **Product Owner** after consultation with engineering leads.
    
- Documentation updates follow a version-controlled workflow, ensuring all changes are reviewed before merging.
    

**2.4 RACI Chart**

**Legend:**

- 🟥 **A** = Accountable   - 🟦 **R** = Responsible  - 🟨 **C** = Consulted - 🟩 **I** = Informed

| **Task**                       | **PM** | **Dev Interns** | **Recruitment Lead** | **QA Intern** |
| ------------------------------ | ------ | --------------- | -------------------- | ------------- |
| System Design & Planning       | 🟥 A   | 🟦 R            | 🟨 C                 | 🟩 I          |
| Link Generator Development     | 🟥 A   | 🟦 R            | 🟩 I                 | 🟨 C          |
| Tracking Script Implementation | 🟥 A   | 🟦 R            | 🟩 I                 | 🟨 C          |
| Google Sheet Automation        | 🟥 A   | 🟦 R            | 🟨 C                 | 🟨 C          |
| Quality Assurance & Testing    | 🟥 A   | 🟨 C            | 🟨 C                 | 🟦 R          |
| User Training & Documentation  | 🟦 R   | 🟨 C            | 🟨 C                 | 🟩 I          |


## **3. Business Requirements**

### **3.1 Functional Requirements** 

The ALX Recruitment Tracker must provide the following key functional capabilities:

1. **Referral Link Generation**
    
    - Admins can create secure referral links for officers using HMAC-SHA256 signatures.
        
    - Each link is uniquely associated with an officer and campaign.
        
    - Links are stored and can be re-generated or revoked if necessary.
        
2. **Tracking Clicks and Signups**
    
    - Track click events when users visit via referral links, capturing metadata (timestamp, IP, user agent).
        
    - Track signup events upon successful candidate registration and attribute them to the correct officer and campaign.
        
3. **Data Aggregation and Reporting**
    
    - Aggregate click and signup data daily for dashboard display.
        
    - Support exporting aggregated metrics to Google Sheets for reporting purposes.
        
4. **Dashboard and Analytics**
    
    - Admin dashboard: View all campaigns, officer performance, and system-wide KPIs.
        
    - Officer dashboard: View personal campaign performance metrics and trends.
        
    - Allow filtering and sorting by date range, campaign, and performance metrics.
        
5. **Security and Fraud Detection**
    
    - Detect abnormal click or signup patterns indicative of fraud.
        
    - Restrict access to data based on user role (Admin, Officer).
        

### **3.2 KPIs & Measurement Plan** 

**Core KPIs**

- **Click-to-Signup Conversion Rate (CTR)** = (Signups ÷ Clicks) × 100
    
-  **Click count and Signup Count** 
    

**Measurement Approach**

- Events (click, signup) logged in tracking database and timestamped.
    
- Metrics computed daily and cached for real-time dashboard queries.
    
- Weekly summaries exported to Google Sheets for long-term storage and review.
    

### **3.3 Non-Functional Requirements**

1. **Reliability**
    
    - System uptime of at least 99.5%.
        
    - Automatic retries for failed background export tasks.
        
2. **Security**
    
    - JWT-based authentication with httpOnly cookies.
        
    - Strict role-based permission checks for all API endpoints.
        
    - Fraud prevention via anomaly detection in event logs.
        
3. **Performance**
    
    - Dashboard load time under 2 seconds for typical queries.
        
    - Tracking endpoints handle high click traffic with minimal database writes (using Redis caching).
        
4. **Usability**
    
    - Simple, clean UI for both admins and officers.
        
    - Mobile-responsive design for officer dashboard access in the field.
        


## **4. Product & UX Overview**

### **4.1 Primary Users Flows**


[![Preview](https://i.ibb.co/sJNqzqkW/Pasted-image-20250815104141.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)


### **4.2 Key Screens** 

- **Admin Dashboard**: Overview of all campaigns, KPIs, and performance trends.
    
- **Campaign Management Screen**: Create, edit, and archive campaigns; assign officers.
    
- **Officer Management Screen**: Add, remove, and manage officer accounts.
    
- **Referral Link List**: View, generate, and manage referral links.
    
- **Report Export Screen**: Select date ranges and export Google Sheets.
    
- **Officer Dashboard**: View campaign-specific performance with charts and tables.
    

### **4.3 Accessibility & Internationalization Guidelines**
    
- Maintain consistent contrast ratios for readability.
    
- Support for English as the default language, with flexibility for future language additions.


## **5. System Architecture (End-to-End)**

### **5.1 Context Diagram & Data Flow**

Flow:

1. **Referral Link Click** — Candidate clicks officer-generated link.
    
2. **Click Tracking** — Backend logs click metadata, stores in Redis & DB.
    
3. **Signup Event** — Candidate completes signup form.
    
4. **Signup Tracking** — Backend matches signup to click event and stores it.
    
5. **Data Aggregation** — Scheduled Celery jobs summarize data daily.
    
6. **Dashboards & Reports** — Aggregated data feeds into frontend dashboards and Google Sheets.
    
[![Preview](https://i.ibb.co/Z1BtR0Qm/Pasted-image-20250810201621.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)



### **5.2 High-Level Components**

- **Frontend (Next.js)** — Client-side dashboards, data fetching, and visualization.
    
- **Backend (Django/DRF)** — API endpoints, business logic, referral tracking, authentication.
    
- **Data Layer** — PostgreSQL database for persistent storage; Redis for caching and rate limiting.
    
- **External Services** — Google Sheets API for exports.
    

[![Preview](https://i.ibb.co/6RnXt8JT/Pasted-image-20250810201310.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)



### **5.3 Deployment Topology & Environment Segregation**

- **Development Environment** — Local development setup with mock services and test data.
    
- **Staging Environment** — Pre-production environment for integration and QA testing.
    
- **Production Environment** — High-availability deployment with monitoring and logging.
    


### **Part II — Frontend Documentation (Next.js)**

#### **1. Tech Stack & Key Design Decisions**

**Core Technologies**

- **Framework**: Next.js 14 (App Router) — optimized for SSR/ISR
    
- **Language**: TypeScript 5.x (strict type safety)
    
- **Styling**: Tailwind CSS + Headless UI (utility-first components)
    
- **Data Management**: SWR (stale-while-revalidate) + Zustand
    
- **Visualization**: Recharts (lightweight SVG charts)
    
- **Tables**: TanStack Table (virtualized rows)
    
- **Forms**: React Hook Form + Zod validation
    

**Critical Architecture Choices**

1. **JWT Authentication**
    
    - Access tokens stored in memory (client-side)
        
    - Refresh tokens stored in `httpOnly` cookies (secure)
        
2. **API Proxying**
    
    - All backend requests routed through Next.js Route Handlers
        
    - Prevents direct exposure of DRF endpoints
        
3. **Real-Time Dashboards**
    
    - SWR polling at 8-second intervals with automatic revalidation
        
4. **Security Protocols**
    
    - SameSite=Lax cookies
        
    - Zod input validation and sanitization
        
    - Minimal PII logging on frontend
        


#### **2. Architecture & Folder Structure**

```bash
web/
├── app/
│   ├── (public)/               
│   │   ├── login/page.tsx            
│   │   ├── signup-success/page.tsx   
│   │   └── track/[ref]/page.tsx      
│   ├── dashboard/              
│   │   ├── page.tsx            
│   │   ├── officers/page.tsx   
│   │   ├── campaigns/page.tsx  
│   │   ├── links/page.tsx      
│   │   └── exports/page.tsx    
│   ├── api/                    
│   │   ├── auth/               
│   │   ├── officers/           
│   │   ├── campaigns/          
│   │   ├── links/              
│   │   ├── stats/              
│   │   └── tracking/           
│   └── layout.tsx              
├── components/
│   ├── ui/                     
│   ├── charts/                 
│   ├── tables/                 
│   ├── forms/                  
│   └── feedback/               
└── lib/
    ├── api.ts                  
    ├── auth.ts                 
    └── swr.ts                  
```

**Route Protection Matrix**

|Path|Access Rules|Security Layer|
|---|---|---|
|`/dashboard/**`|`SUPER_ADMIN` or `OFFICER`|Middleware JWT check|
|`/dashboard/links`|`OFFICER` (read-only)|Component-level RBAC|
|`/api/admin/**`|`SUPER_ADMIN` only|Server-side role validation|


#### **3. Authentication Flow**

**Login Sequence**

1. Client submits credentials to `/api/auth/login`
    
2. Next.js proxy forwards to DRF `/auth/jwt/create`
    
3. Sets `refresh_token` as `httpOnly` cookie
    
4. Returns short-lived `access_token` to client state
    
5. Fetches user profile via `/api/me`



[![Preview](https://i.ibb.co/8DpGnQ6J/Pasted-image-20250815113635.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)

**Session Maintenance**

- Automatic token refresh on 401 errors
    
- Silent re-authentication via refresh token
    
- Global middleware validates JWT for protected routes
    

#### **4. Data Handling Strategy**

**Fetching Patterns**

|Method|Use Case|Example|
|---|---|---|
|**SSR**|Initial dashboard load|`getServerSideProps`|
|**SWR Polling**|Real-time metrics|`useSWR(..., { refreshInterval: 8000 })`|
|**Optimistic UI**|CRUD operations|Client cache update before API response|

**Error Handling**

- 4xx errors → User-friendly toast notifications
    
- 5xx errors → Fallback UI with retry CTA
    
- Network failures → Exponential backoff retries
    

#### **5. Key Functional Modules**

**1. Referral System**

- **Link Generation**
    
    - POST `/api/links` with `{officer_id, campaign_id}`
        
    - Returns HMAC-signed URL + QR code
        
- **Attribution Tracking**
    
    - `/track/[ref]`: Sets referral cookie + logs click
        
    - `/signup-success`: Attributes conversions on mount
        

**2. Dashboard Analytics**

- **KPI Cards**: Total clicks/signups/conversions
    
- **Charts**:
    
    - Officer performance rankings
        
    - Campaign conversion trends
        
    - Historical signup velocity
        
- **Data source**: `/api/stats` (backend aggregates)
    

**3. Bulk Operations**

- CSV officer upload via FormData
    
- Row-level validation feedback
    
- Atomic update transactions
    

#### **6. Security Implementation**

**Core Protocols**

- `httpOnly` cookies for refresh tokens
    
- CSRF protection via SameSite policies
    
- Strict CSP headers (Vercel-managed)
    
- Rate limiting UX (debounced actions)
    

**Data Privacy**

- Minimal PII in UI rendering
    
- Sensitive field redaction in logs
    
- Google Sheets export compliance
    

#### **7. Testing Approach**

**Validation Layers**

|Test Type|Tools|Coverage|
|---|---|---|
|Unit|Vitest + Testing Library|Components/hooks|
|Integration|Playwright|User workflows|
|Accessibility|axe-core|WCAG 2.1 AA|
|Performance|Lighthouse|Core metrics|


#### **8. Implementation Timeline**

| Week | Task                                                                                                                                | Dependencies                  |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1    | Scaffolding, auth proxy, layout, design system                                                                                      | Backend JWT API               |
| 2    | Officers & Campaigns CRUD + tables                                                                                                  | DRF endpoints                 |
| 3    | Referral Links module + QR + copy                                                                                                   | HMAC service                  |
| 4    | Dashboard aggregates + charts; SWR real-time                                                                                        | Aggregation API               |
| 5    | Exports view + thank-you & tracking pages; polish                                                                                   | Tracking service              |
| 6    | Hardening (accessibility, errors, edge cases), E2E, full integration test; perf & security passes; launch readiness; docs & handoff | Feedback & monitoring systems |


#### **9. Handover Notes**

1. **API Proxy Architecture**
    
    - All DRF endpoints accessed exclusively via `/api/**` routes
        
    - Centralized error handling in fetch wrapper
        
2. **Real-Time Limitations**
    
    - Current SWR polling can be upgraded to WebSockets if needed
        
3. **Demo Environment**
    
    - `/track/[ref]` and `/signup-success` are self-contained
        
    - Can be tested without production data
        
4. **Backend Integration Points**
    
    - Strict adherence to DRF's HMAC signature schema
        
    - Shared RBAC permission matrix
        
    - Google Sheets export webhook alignment
        


## **Part III — Backend Documentation (Django/DRF)**

### 13. Tech Stack & Service Overview

**13.1 Django REST Framework & Supporting Services**

- **Django & DRF:** Core backend framework for REST APIs.
    
- **Redis:** Caching for tracking endpoints and session storage.
    
- **Celery + Redis Broker:** Background tasks (exporting data to Google Sheets).
    
- **Google Sheets API:** Automated reporting/export of aggregated data.
    
- **PostgreSQL:** Relational database with strong support for indexing and constraints.
    
- **Testing:** # pytest pytest-factoryboy(facking data)   pytest-cov(esting coverage area)  pytest-html(for nice reporting)  locust (load testing).
    

**13.2 Justification for Tech Choices**

- DRF provides **robust serializers, permissions, and pagination**.
    
- Redis + Celery ensures **scalable background processing**.
    
- Google Sheets API supports **business requirement for shared, automated reporting**.
    
- HMAC ensures **tamper-proof referral links**.

### 14. Modular Django Apps Structure

|App|Responsibility|
|---|---|
|`authservices`|JWT Authentication, Role-Based Access Control (Admin, Officer), Password management|
|`linkgenservices`|Referral link generation using HMAC_SHA256, enforcing max links per officer & campaign validity|
|`trackingservices`|Click & signup tracking logic, cookie/session tracking for cross-device reliability|
|`backgroundworker`|Scheduled aggregation and export jobs to Google Sheets using Celery|


### 15. Models & Database Schema

[![Preview](https://i.ibb.co/4wVhCyx3/alx-ETrt-schema-1.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)

### 16. Core Functional Flows

**16.1 Referral Code Creation Process**

- Admin creates referral link for officer/campaign.
    
- HMAC_SHA256(ref_code) generated using `officer_id`, `campaign_id`, timestamp, and secret key.
    
- Save referral link in DB; enforce max links per officer.

[![Preview](https://i.ibb.co/ym6MyLdr/Pasted-image-20250815115431.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)
  

**16.2 Click Tracking Flow**

- User clicks referral link.
    
- `trackingservices` logs click (IP, user-agent).
    
- Increment `click_count` in Referral model.
    
- Redirect to `sign_up` page.


[![Preview](https://i.ibb.co/tTSgnM0v/Pasted-image-20250815115550.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)

**16.3 Signup Tracking Flow**

- On successful signup, validate referral code from URL/cookie.
    
- Log signup in `SignupLog`.
    
- Increment `signup_count`.
    
- Update dashboard metrics in real-time (Redis caching).
[![Preview](https://i.ibb.co/1YZJKKPF/Pasted-image-20250815115837.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)

**16.4 Data Aggregation & Export Flow**

- Celery scheduled daily.
    
- Aggregate data: clicks, signups, conversion rate per officer & campaign.
    
- Export to Google Sheets using Google Sheets API.
    
[![Preview](https://i.ibb.co/CpLZDKnP/Pasted-image-20250815115949.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)

### 17. Authentication & Authorization

**17.1 JWT Authentication**

- Use **SimpleJWT** for access & refresh tokens.
    
- Password change on first login enforced.
    

**17.2 DRF Permission Classes**

- Admin: Can manage campaigns, officers, referral links, and exports.
    
- Officer: Can view dashboard metrics, referral links assigned to them.
    

**17.3 Role-Based Access**

- Enforced at viewset level using DRF permissions & decorators.
    
### 18. Performance Optimization & Caching

**18.1 Redis Caching Strategy**

- Applied caching on frequent and expensive **GET** requests to reduce database hits.
    
- Cached heavy aggregate queries (e.g., admin dashboards, officer stats) with short TTLs (10–60s) to balance freshness and performance.
    
- Officer-specific stats cached per-user to isolate data and avoid cross-user leaks.
    

### 19. Background Tasks & Scheduling

**19.1 Celery Worker Setup**

- Background workers configured using **Celery** with Redis broker.
    
- Tasks include data exports, metrics aggregation.
    

**19.2 Export Job Flow**

- Scheduled background jobs periodically sync system data with external storage and reporting platforms (e.g., Google Sheets).
    

**19.3 Retry & Error Handling Policies**

- Celery built-in retries used for transient failures (e.g., Redis disconnects, API timeouts).
    
- Errors logged centrally for monitoring and debugging.
    

**19.4 Monitoring & Visibility**

- Workers monitored through a task monitoring dashboard (Flower).
    
- Provides insight into task queues, retry counts, worker health, and throughput.
    
### 20. Error Handling

**20.1 Centralized Exception Handling**

- Implemented a custom **DRF exception handler override** to standardize API responses.
    
- Validation ensures business rules (e.g., campaign dates, officer assignments) are enforced at the API layer.

### 21. API Documentation Generation

**21.1 django-spectacular Setup**

- Automatic **OpenAPI 3.0** documentation generated using django-spectacular.
    
- Documentation includes details on authentication, pagination, throttling, and query parameters.
    
- Developers can explore endpoints through interactive Swagger/ReDoc interfaces.
    

**21.2 API Consistency**

- Documentation updated alongside schema changes to ensure reliability.
    
- Versioning supported for future backward compatibility.
    

### 22. Testing & Quality Assurance

**22.1 Unit & Integration Testing**

- Frameworks used: `pytest`, `pytest-django`, `pytest-factoryboy`.
    
- Coverage tools: `coverage` and `pytest-cov` with enforced thresholds (e.g., ≥80%).
    
- Structured test reporting via `pytest-html`.
    
- Tests executed on both local development and deployment servers to validate consistency.
    

**22.2 Performance & Load Testing**

- Load testing conducted with `locust`.
    
- Scenarios :
    
    - Tracking service load tests 
        
    - dashboard service (admin and officer) load tests 
        
    - combined load test 
        
- Results documented with charts and screenshots of response times, request throughput, and error rates.
    

**22.3 Background Worker Reliability**

- Verified worker resilience with Redis broker, Celery workers, and Celery Beat scheduler.
    
- Real-time task monitoring performed via Flower
    

**22.4 Deployment & Server Validation**
    
- Coverage and load tests rerun against staging/production-like environments.
    
- Reports archived as part of deployment documentation for transparency.
    

**22.5 Reporting & Artifacts**

- Generated HTML/PDF reports for test results, coverage metrics, and load testing.
    
- Visual documentation includes:
        
    - Locust performance graphs.
        
    - Flower monitoring dashboard screenshots.
    


### 23. Execution Plan by Phases (Backend)

| **Week**    | **Phase**                              | **Backend Tasks**                                                                                                                                                        |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Week 1**  | **Setup & Architecture**               | - Define requirements and architecture - Set up Django project & virtual environment - Initialize GitHub repo & branching strategy - Design ER diagram & database schema |
| **Week 2**  | **Core Models & Migrations**           | - Implement models for Officer, Campaign, Referral, ClickLog, SignupLog - Run initial migrations - Deploy database (PostgreSQL) and validate schema                      |
| **Week 3**  | **Core Views & Serializers (Part 1)**  | - Implement serializers & views for Officer, Campaign, Referral - Add referral link generation logic (HMAC) - Configure authentication & registration                    |
| **Week 4**  | **Core Views & Serializers (Part 2)**  | - Implement click tracking & signup tracking flows - Add pagination, filtering, throttling - Apply query optimization for core endpoints                                 |
| **Week 5**  | **Advanced Features & RBAC**           | - Implement role-based access control (Admin vs Officer) - Build admin dashboards & officer dashboards - Add audit logs and validations                                  |
| **Week 6**  | **Background Tasks & Integration**     | - Configure Celery workers with Redis broker - Add scheduled exports with Celery Beat - Integrate Google Sheets API for reporting - Set up Flower monitoring             |
| **Week 7**  | **Testing & Coverage (Phase 1)**       | - Set up pytest framework - Write unit and integration tests for core flows - Generate coverage and HTML test reports                                                    |
| **Week 8**  | **Performance & Load Testing**         | - Conduct load tests with Locust - Optimize slow queries and endpoints - Measure system performance under concurrent usage                                               |
| **Week 9**  | **Documentation & API Review**         | - Finalize API documentation with drf-spectacular (OpenAPI/Swagger) - Review pagination, throttling, and caching consistency - Update developer guidelines               |
| **Week 10** | **Stabilization & Launch Preparation** | - Run end-to-end tests across services - Perform deployment validation  - Archive reports (coverage, load testing, monitoring) - Prepare final deliverables              |


---

## **Part IV — Shared API Specification**

### 23. API Standards & Guidelines

- **23.1 OpenAPI 3.0 Compliance**: All APIs will follow OpenAPI 3.0 specifications for consistency, documentation, and auto-generation of client SDKs.
    
- **23.2 Versioning Strategy**: Versioned endpoints (`/api/v1/...`) to allow safe iteration and backward compatibility.
    
- **23.3 Naming & Resource Structure**: RESTful conventions with clear plural resource names (`/officers`, `/campaigns`, `/referrals`). Endpoint paths reflect resource hierarchy.
    

### 24. Authentication & Session Flow

- **24.1 Access/Refresh Tokens**: JWT-based access tokens for API calls with refresh tokens to renew sessions.
    
- **24.2 Cookie & Proxy Patterns**: Use secure HTTP-only cookies for web frontend sessions; API supports token-based calls for other clients (mobile, scripts).
    

### 25. RBAC in APIs

- **25.1 Admin Endpoints**:
    
    - Manage officers, campaigns, referral limits, and view global statistics.
        
    - Access restricted to users with `admin` role.
        
- **25.2 Officer Endpoints**:
    
    - View assigned campaigns and referral links, track personal performance.
        
    - Access limited to assigned officer data only.
        

### 26. Endpoint Catalog (High-Level)

- **26.1 Officers**: CRUD operations for officer profiles, credentials, and role assignments.
    
- **26.2 Campaigns**: Create, update, and manage campaigns with metadata (start/end dates, description).
    
- **26.3 Referral Links**: Generate, list, and validate referral links per officer & campaign.
    
- **26.4 Tracking Events**: Record clicks and sign-ups via dedicated endpoints.
    
- **26.5 Statistics & Reports**: Fetch aggregated counts, conversion rates, and export-ready summaries.
    

### 27. Tracking API Details

- **27.1 Click Event Endpoint**:
    
    - Records `ref_code`, timestamp, user agent.
        
    - Returns redirect URL to frontend for signup page.
        
- **27.2 Signup Event Endpoint**:
    
    - Logs confirmed signups linked to a referral code.
        
    - Updates dashboard counts in near real-time.
        

### 28. API Performance & Limits

- **28.1 Rate Limiting**: Limit per IP and per API key to prevent abuse and spikes.
    
- **28.2 Caching Policies**: Cache static resources and frequent queries (dashboard stats) for faster response.
    
- **28.3 Error Codes & Responses**: Standardized response format with HTTP codes (200, 201, 400, 401, 403, 404, 429, 500) and structured error messages.
    


### **Part V — Data & Analytics Documentation**  

### **29. Metrics Catalog & KPI Definitions**  

**29.1 Core Performance Metrics**  

- **Clicks**: Total clicks on referral links  
- **Sign-ups**: Completed sign-ups attributed to referral links  
- **Enrollments**: Sign-ups who complete program enrollment  
- **Officer Count**: Active recruitment officers  
- **Campaign Count**: Active/historical campaigns  
- **Link Count**: Unique referral links generated  

**29.2 Conversion & Efficiency KPIs**  

- **Click-to-Sign-up Rate**: `(Sign-ups / Clicks) × 100`  
- **Sign-up-to-Enrollment Rate**: `(Enrollments / Sign-ups) × 100`  
- **Total Conversion Rate**: `(Enrollments / Clicks) × 100`  
- **Referral Bounce Rate**: Clicks without sign-ups within time window  

**29.3 Officer & Campaign KPIs**  

- **Average Clicks per Officer**: Mean clicks per officer  
- **Sign-ups per Campaign**: Campaign-specific sign-ups  
- **Officer Conversion Score**: Weighted sign-ups + conversion rate  
- **Daily Sign-up Velocity**: Avg. daily sign-ups per campaign  
- **Campaign Lifetime Performance**: Total conversion rate from start to end  

**29.4 Time-Based KPIs**  

- **Rolling Avg. Conversion**: 7/30-day moving average  
- **YoY Growth**: YoY change in clicks/sign-ups  
- **Hourly Engagement Peaks**: Top 3 hourly sign-up windows  

**29.5 Security & Fraud KPIs**  
- **Fraud Score**: Composite metric for suspicious activity  


### **30. Data Models & Event Schema**  

**30.1 Click Event Schema**  

| Field             | Type     | Description             |
| ----------------- | -------- | ----------------------- |
| `timestamp`       | DateTime | ISO 8601 event time     |
| `eventType`       | String   | Always `"click"`        |
| `referralID`      | String   | HMAC link ID            |
| `officerID`       | String   | Associated officer      |
| `campaignID`      | String   | Parent campaign         |
| `campaignName`    | String   | Campaign name           |
| `ipAddressMasked` | String   | First 2 IP octets       |
| `userAgent`       | String   | Raw device/browser info |

**30.2 Signup Event Schema**  

| Field              | Type     | Description                  |
| ------------------ | -------- | ---------------------------- |
| `timestamp`        | DateTime | ISO 8601 event time          |
| `eventType`        | String   | Always `"signup"`            |
| `userEmail`        | String   | Hashed email                 |
| `referralID`       | String   | HMAC link ID                 |
| `officerID`        | String   | Associated officer           |
| `campaignID`       | String   | Parent campaign              |
| `conversionTime`   | Integer  | Minutes from click to signup |
| `enrollmentStatus` | String   | `"pending"` or `"completed"` |


### **31. Dashboards**  

**31.1 Admin Dashboard**  
- **Performance Funnel**: Clicks → Sign-ups → Enrollments  
- **Officer Leaderboard**: Ranked by Conversion Score  
- **Campaign Comparison**: Side-by-side sign-ups & conversion rates  
- **Daily Trends**: 30/60/90-day sign-up velocity line chart  
- **Geo Heatmap**: Sign-ups by geographic region  

**31.2 Officer Dashboard**  
- **Personal KPIs**: Officer-specific clicks/sign-ups/conversion rate  
- **Progress Tracking**: Historical clicks/sign-ups timeline  
- **Campaign Breakdown**: Performance per assigned campaign  

[![Preview](https://i.ibb.co/5xjf79ZZ/Pasted-image-20250815131831.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)

### **32. Advanced Insights & Analysis**  

**32.1 Cross-Campaign Officer Performance**  
- Compare officer metrics across multiple campaigns  
- Measure adaptability to different campaign types  

**32.2 Conversion Time Distribution**  
- Bins: `<1h`, `1-24h`, `>24h`  
- Identify friction in sign-up flow  

**32.3 Fraud Risk Analysis**  
- throttling 


### **33. Reporting & Exports**  

**33.1 Google Sheets Structure**  

| Sheet              | Purpose                  | Key Columns                                 |
| ------------------ | ------------------------ | ------------------------------------------- |
| `Tracker_Raw_Data` | Event-level records      | Timestamp, EventType, ReferralID, OfficerID |
| `Officer_Summary`  | Aggregated officer stats | OfficerName, TotalClicks, ClickToSignupRate |
| `Campaign_Summary` | Campaign performance     | CampaignName, TotalSignups, DailyVelocity   |
| `Time_Series_Data` | Trend analysis           | Date, TotalSignups, ConversionRate          |

**33.2 Automation Schedule**  

- **Real-time**: Click/sign-up events  
- **Hourly**: Officer summaries  
- **Daily (3:00 AM UTC)**: Campaign reports  
- **Monthly**: YoY trend exports  


### **34. Data Governance & Quality**  

**34.1 Validation Rules**  
1. `Clicks >= Sign-ups` (enforced at ingestion)  
2. `conversionTime > 0` (for sign-up events)  
3. Unique `(referralID, timestamp)` per event  


## **Part VI — Operations & Maintenance**

### 36. Security, Privacy & Compliance

**36.1 Threat Model & Risks**

- Data exfiltration (leaked PII, hashed emails)
    
- Unauthorized access (officer or admin accounts)
    
- Fraudulent signups or referral abuse
    

**36.2 Security Controls**

- JWT Authentication (access & refresh tokens)
    
- `httpOnly` & `Secure` cookies for session safety
    
- CSRF Tokens for state-changing requests
    
- IP masking for privacy
    
- Password hashing & secure storage
    


### 37. Performance & Reliability

**37.1 Load Testing**

- Stress tests on click/signup events
    
- Benchmark API response times per endpoint
    
- Identify bottlenecks in DB queries & caching layers
    
- Simulate high concurrent officer activity
    


### 38. Testing & Quality Assurance (Cross-Team)

**38.1 Test Pyramid**

- **Unit Tests** — isolated functions/models
    
- **Integration Tests** — APIs, event logging, DB interactions
    
- **End-to-End Tests** — full funnel from click → signup → enrollment
    
[![Preview](https://i.ibb.co/1f8jPSVp/Pasted-image-20250815133639.png)](https://github.com/Ethioware-EdTech-Initiative/Referral-Link-Tracker.git)

### 39. DevOps & Deployment (Cross-Team)

**39.1 Environment Matrix**

| Environment | Backend                    | Frontend          | DB / Cache        | Notes                           |
| ----------- | -------------------------- | ----------------- | ----------------- | ------------------------------- |
| Dev         | NeonTech(DB), Vercel (api) | Vercel            | Upstash Redis     | Free plan, feature testing      |
| Prod        | Production Server          | Production Server | Production Server | Live system, monitoring enabled |


## **Part VII — Appendices**

**41.1 References & Linked Documents**

- https://docs.google.com/document/d/1aTSfJUKs8-5z5GNj87hEsMp6YZVnjccXgBQP05XaZBY/edit?tab=t.0
- https://t.me/c/2148887449/2095/2688
- https://t.me/c/2148887449/2095/2689
