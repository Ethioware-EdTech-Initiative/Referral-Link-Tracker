![[1721195531703.png]]


**Table of Contents**  
0.2 Version & Date  
0.3 Document Owner & Contributors

**Part I — General Overview** 

1. Executive Summary 
    
2. Stakeholders & Governance 
    
3. Business Requirements 
      3.1 Functional Requirements 
      3.2 KPIs & Measurement Plan
        Core KPIs
        Measurement Approach 
      3.3 Non-Functional Requirements 
    
4. Product & UX Overview 
      4.1 Primary User Flows 
      4.2 Key Screens 
      4.3 Accessibility & Internationalization Guidelines 
    
5. System Architecture (End-to-End)
      5.1 Context Diagram & Data Flow 
      5.2 High-Level Components 
    
<div style="page-break-before: always;"></div>

**Part II — Frontend Documentation (Next.js)**
6. Tech Stack & Key Design Decisions
  6.1 Core Technologies 
  6.2 Critical Architecture Choices 
  6.3 Route Protection Matrix  
  6.4 Login Sequence 
  6.5 Session Maintenance 
  6.6 Fetching Patterns 
  6.7 Error Handling
  6.8 Link Generation
  6.9 Attribution Tracking 
  6.10 Core Protocols 
  6.11 Data Privacy
  6.12 Validation Layers 
<div style="page-break-before: always;"></div>

**Part III — Backend Documentation (Django/DRF)**
7. Tech Stack & Service Overview
8. Modular Django Apps Structure  
9. Models & Database Schema 
10. Core Functional Flows 
11. Performance Optimization & Caching
12. Background Tasks & Scheduling 
13. Error Handling 
14. API Documentation Generation 
15. Execution Plan by Phases (Backend)

**Part IV — Shared API Specification** 
16. API Standards & Guidelines  
17. Authentication & Session Flow 
18. RBAC in APIs 
19. Endpoint Catalog (High-Level) 
20. Tracking API Details  
21. API Performance & Limits 

**Part V — Data & Analytics Documentation** 
22. Metrics Catalog & KPI Definitions 
23. Data Models & Event Schema 
24. Dashboards
25. Advanced Insights & Analysis 
26. Reporting & Exports 
27. Data Governance & Quality 
<div style="page-break-before: always;"></div>

**Part VI — Operations & Maintenance** 
29. Security, Privacy & Compliance 
30. Performance & Reliability 
31. Testing & Quality Assurance (Cross-Team) 
32. DevOps & Deployment (Cross-Team) 

**Part VII — Appendices**

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
| 1.1     |           |                 |                                     |

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

![[Pasted image 20250815104141.png]]


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
    

![[Pasted image 20250810201621.png]]


### **5.2 High-Level Components**

- **Frontend (Next.js)** — Client-side dashboards, data fetching, and visualization.
    
- **Backend (Django/DRF)** — API endpoints, business logic, referral tracking, authentication.
    
- **Data Layer** — PostgreSQL database for persistent storage; Redis for caching and rate limiting.
    
- **External Services** — Google Sheets API for exports.
    

![[Pasted image 20250810201310.png]]



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


    ![[Pasted image 20250815113635.png]]

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
    
- **HMAC_SHA256:** Secure referral code generation.
    

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

![[Pasted image 20250810202435.png]]

### 16. Core Functional Flows

**16.1 Referral Code Creation Process**

- Admin creates referral link for officer/campaign.
    
- HMAC_SHA256(ref_code) generated using `officer_id`, `campaign_id`, timestamp, and secret key.
    
- Save referral link in DB; enforce max links per officer.

    ![[Pasted image 20250815115431.png]]

**16.2 Click Tracking Flow**

- User clicks referral link.
    
- `trackingservices` logs click (IP, user-agent).
    
- Increment `click_count` in Referral model.
    
- Redirect to `sign_up` page.

	![[Pasted image 20250815115550.png]]

**16.3 Signup Tracking Flow**

- On successful signup, validate referral code from URL/cookie.
    
- Log signup in `SignupLog`.
    
- Increment `signup_count`.
    
- Update dashboard metrics in real-time (Redis caching).

  ![[Pasted image 20250815115837.png]]

**16.4 Data Aggregation & Export Flow**

- Celery scheduled daily.
    
- Aggregate data: clicks, signups, conversion rate per officer & campaign.
    
- Export to Google Sheets using Google Sheets API.
    
  ![[Pasted image 20250815115958.png]]
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

- Cache dashboard metrics (signups/clicks/conversion rate).
    
- Cache frequent GET requests to reduce DB hits.
    
### 19. Background Tasks & Scheduling

**19.1 Celery Worker Setup**

- Use Redis broker; set concurrency limits to handle traffic spikes.
    

**19.2 Export Job Flow to Google Sheets**

- periodic schedule: fetch aggregated metrics → format → update sheet.

**19.3 Retry & Error Handling Policies**

- Use Celery built-in retries; log errors.
    
- Send notifications on repeated failures.

### 20. Error Handling

**20.1 Centralized Exception Handling**

- DRF exception handler override for API consistency.

### 21. API Documentation Generation

**21.1 django-spectacular Setup**

- Automatic OpenAPI 3.0 docs.
    
- Includes **pagination, throttling, query optimization** for endpoints.


### 22. Execution Plan by Phases (Backend)

| **Week**   | **Phase**                                | **Backend Tasks**                                                                                                                                                                        |
| ---------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Week 1** | **Setup & Architecture**                 | - Django project & virtual environment setup- GitHub repo & branching strategy- Define ER diagram & DB schema- Implement models & run migrations                                         |
| **Week 2** | **Core Views & Serializers (Part 1)**    | - Implement serializers & views for Officer, Campaign, Referral, ClickLog, SignupLog- Start referral link generation logic (HMAC)- Register Officers & authentication                    |
| **Week 3** | **Core Views & Serializers (Part 2)**    | - Complete referral link generation- Implement click tracking & signup tracking- Pagination, filtering, throttling, query optimization                                                   |
| **Week 4** | **Advanced Features & Reporting**        | - Advanced filtering & reporting endpoints- Nested serializers & complex relationships- Permissions & role-based access control- Optimizations for large datasets                        |
| **Week 5** | **Exports & Integration**                | - Implement export (CSV/Excel)- Integrate Google Sheets API- Add Celery for scheduled exports- Support frontend API integration                                                          |
| **Week 6** | **Testing, Documentation & Launch Prep** | - Unit tests for core logic & exports- Full integration & end-to-end testing- API documentation (django-spectacular)- Performance, security checks- Deployment prep & final deliverables |


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

  ![[Pasted image 20250815131831.png]]

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
    
    ![[Pasted image 20250815133639.png]]

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

