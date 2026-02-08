# Product Requirements Document (PRD)

**Product:** New Day Learning ERP
**Company:** New Day Learning LLC
**Industry:** DDD Services (New Jersey)
**Primary Users:** Owner/Admin, Billing Admin, Support Coordinators (Read-only), Accountant (Read-only)
**Devices:** 70% Mobile, 30% Desktop
**Tech Skill Level:** Basic

---

## 1. Executive Summary

**Purpose:**
To build a **mobile-first, lightweight ERP system** that manages:
*   DDD client services
*   Authorizations & budgets
*   Scheduling & service delivery
*   Billing, invoicing & payments
*   Financial reporting & growth tracking

The system must **reduce missed payments**, **improve invoice tracking**, and **support scaling operations**.

---

## 2. Goals & Success Metrics

### Business Goals
*   Eliminate missed or delayed invoices
*   Maintain real-time visibility into client budgets
*   Simplify billing to the State / DDD
*   Provide clear P&L and budgeting visibility
*   Enable future expansion (more clients, staff, locations)

### Success Metrics
*   **100% invoices generated** per authorization period
*   **Zero budget overruns** without warnings
*   **Reduced billing cycle time**
*   **Accurate monthly P&L reporting**

---

## 3. User Roles & Access Control

| Role | Permissions |
| :--- | :--- |
| **Owner/Admin** | Full access to all modules. |
| **Billing Admin** | Access to Billing, Invoices, Agreements, and Payments. |
| **Staff / Providers** | Access to Scheduling, Session Logs, and Notes (Own data only). |
| **Support Coordinator** | Read-only access to assigned Clients, Budgets, and Services. |
| **Accountant** | Read-only access to Financial Reports. |

**Requirements:**
*   Role-based access control (RBAC).
*   Field-level restrictions where necessary.
*   Full audit trail of all actions.

---

## 4. Core Modules

### 4.1 Client Management
*   **Profile Storage:** Name, DOB, DDD ID, Contact Info.
*   **Budgeting:** Authorized budgets, Approved Services, Start/End dates.
*   **Relationships:** Parent/Guardian details.
*   **Flexibility:** Custom notes and fields allowed.
*   *Note:* Clients may have multiple active services.

### 4.2 Support Coordination Management
*   **Agencies:** Track multiple support coordination agencies.
*   **Details:** Coordinator Name, Agency Name, Contact Info, Billing Info.
*   **Assignments:** Link Coordinators to specific Clients.

### 4.3 Services & Authorizations
*   **Billing Units:** Per Session or Per Mileage.
*   **Authorization Types:** Hour-based, Dollar-based, or Mixed.
*   **Periods:** Variable authorization periods per client.
*   **Capacity:** Multiple concurrent services per client.

### 4.4 Scheduling & Service Delivery
*   **Tracking:** Scheduled, Completed, Missed, and Canceled sessions.
*   **Providers:** Internal Staff and Contractors.
*   **Session Data:** Time In/Out, Location, Notes/Progress, Mileage.

### 4.5 Billing & Invoicing
*   **Cycle:** Based on authorization period.
*   **Generation:** Auto-generate from completed sessions.
*   **Content:**
    *   Invoice #, Client, Coordinator/Agency.
    *   Service breakdown, Dates, Total Billed.
    *   Remaining Budget calculation.
*   **Delivery:** PDF Export, Email, Portal Download.

### 4.6 Payments
*   **Methods:** ACH, Check, etc.
*   **Features:** Partial payments, Payment Dates, Manual entry.
*   **Policy:** No auto-locks; manual follow-up driven.

### 4.7 Budget Management
*   **Logic:** Deduct from budget upon Invoice Generation.
*   **Notifications:** Warnings when budget nears exhaustion (Soft limits).

### 4.8 Portals
*   **Support Coordinator Portal:** Read-only view of Budgets, Services Used, and Upcoming Sessions.

### 4.9 Marketing & Referrals (CRM Lite)
*   **Sources:** Agencies, Coordinators, Web, Social, Referral.
*   **Tracking:** Dates, Description, Status (Lead -> Active).
*   **Reminders:** Intake follow-ups, Auth renewals.

### 4.10 Financial Reporting
*   **Key Reports:**
    *   Revenue by Client / Service.
    *   Outstanding Invoices (AR).
    *   Monthly P&L.
    *   Budget vs Actual.
    *   Staff Cost vs Revenue.

---

## 5. Compliance & Records
*   **Storage:** Signed Docs, Authorizations, Service Notes, Mileage Logs.
*   **Retention:** Minimum **3 Years**.
*   **Audit:** Full history (Who, What, When).

---

## 6. Notifications
*   Budget Warnings
*   Authorization Expiration
*   Invoice Generated
*   Payment Received

---

## 7. Non-Functional Requirements
*   Mobile-First UI
*   Simple, Intuitive Workflows
*   Secure Access Control
*   Scalable Architecture
*   Google Workspace Compatible (MVP)

---

## 8. Implementation Path

### Phase 1: MVP (Google Apps Script)
*   **Database:** Google Sheets.
*   **Logic:** Apps Script (Automation, Triggers).
*   **UI:** React/Orbit (Mobile-friendly).
*   **Output:** PDF Invoices, Email Notifications.

### Phase 2: Scale
*   **Backend:** Migration to ERPNext/Frappe or SQL.
*   **Features:** Multi-location, Advanced Finance.

---

## Database Schema (Google Sheets)

### 1. Core Configuration
**Sheet: `Settings`**
| Field | Description |
| :--- | :--- |
| `Company_Name` | New Day Learning LLC |
| `Billing_Cycle_Default` | Monthly / Auth Period |
| `Budget_Warning_%` | e.g. 80 |
| `Invoice_Prefix` | NDL |

**Sheet: `Users`**
| Field | Description |
| :--- | :--- |
| `User_ID` | Unique ID |
| `Name` | Full Name |
| `Email` | Login Email |
| `Role` | Admin, Billing, Staff, etc. |
| `Active` | TRUE/FALSE |

### 2. Client & Coordination
**Sheet: `Clients`**
*   `Client_ID`, `Client_Name`, `DOB`, `DDD_ID`
*   `Guardian_Name`, `Guardian_Email`, `Status`, `Notes`

**Sheet: `Agencies`**
*   `Agency_ID`, `Agency_Name`, `Address`, `Phone`

**Sheet: `Coordinators`**
*   `Coordinator_ID`, `Name`, `Email`, `Agency_ID`

**Sheet: `Client_Coordinators`**
*   `Client_ID`, `Coordinator_ID`, `Start_Date`, `End_Date`

### 3. Services & Authorizations
**Sheet: `Services`**
*   `Service_ID`, `Service_Name`, `Billing_Type` (Session/Mileage), `Rate`

**Sheet: `Authorizations`**
*   `Authorization_ID`, `Client_ID`, `Service_ID`
*   `Authorized_Amount`, `Type` (Hours/Dollars), `Start_Date`, `End_Date`

### 4. Scheduling & Service Delivery
**Sheet: `Staff`**
*   `Staff_ID`, `Name`, `Role`, `Contractor` (Yes/No), `Rate`

**Sheet: `Sessions`**
*   `Session_ID`, `Client_ID`, `Service_ID`, `Staff_ID`
*   `Date`, `Time_In`, `Time_Out`, `Duration`, `Mileage`
*   `Location`, `Status` (Completed/Missed), `Billable`

### 5. Billing & Finance
**Sheet: `Invoices`**
*   `Invoice_ID`, `Invoice_Number`, `Client_ID`, `Agency_ID`
*   `Dates`, `Total_Amount`, `Remaining_Budget`, `Status`

**Sheet: `Invoice_Line_Items`**
*   `Invoice_ID`, `Service_ID`, `Description`, `Qty`, `Rate`, `Total`

**Sheet: `Payments`**
*   `Payment_ID`, `Invoice_ID`, `Date`, `Amount`, `Method`

### 6. Budget Tracking
**Sheet: `Budget_Tracking`** (Script Updated)
*   `Authorization_ID`, `Authorized_Amount`, `Amount_Used`, `Balance`

### 7. Marketing (CRM Lite)
**Sheet: `Leads`**
*   `Lead_ID`, `Client_Name`, `Source`, `Status`, `Notes`

### 8. Audit
**Sheet: `Audit_Log`**
*   `Timestamp`, `User`, `Action`, `Record_Type`, `Record_ID`, `Details`

---

## Logic Map (Apps Script)

**Triggers:**
*   **On Form Submit:** Create Session
*   **Time-Driven:** Generate Invoices (Monthly)
*   **On Payment:** Update Invoice Status

**Core Functions:**
*   `generateInvoiceNumber()`
*   `calculateSessionDuration()`
*   `updateBudgetTracking()`
*   `checkBudgetWarnings()`

---

## Build Order
1.  **Core Data:** Settings, Users, Clients, Agencies.
2.  **Service Layer:** Services, Authorizations.
3.  **Operations:** Staff, Sessions logic.
4.  **Billing:** Invoice generation logic.
5.  **Finance:** Budget tracking & Payments.
6.  **Portals:** Coordinator access.
