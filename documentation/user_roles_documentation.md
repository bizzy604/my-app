# User Roles Documentation for InnoBid Procurement System

## Quick Reference Table

| Section | Title | Description |
|---------|-------|-------------|
| 1 | Introduction | Overview of user roles in InnoBid |
| 2 | Vendor Role | Detailed functionality for vendors |
| 2.1 | Vendor Dashboard | Overview of vendor dashboard features |
| 2.2 | Vendor Tenders | Managing tender applications and history |
| 2.3 | Vendor Profile & Settings | Customization and account management for vendors |
| 3 | Citizen Role | Features available to citizens |
| 3.1 | Citizen Dashboard | Overview of citizen dashboard features |
| 3.2 | Citizen Tenders & Reports | Viewing tenders and reporting irregularities |
| 3.3 | Citizen Statistics | Accessing tender statistics |
| 4 | Procurement Officer Role | Responsibilities and tools for procurement officers |
| 4.1 | Procurement Dashboard | Overview of procurement officer dashboard |
| 4.2 | Tender Management | Creating and managing tenders |
| 4.3 | Evaluation & Reporting | Tools for bid evaluation and anomaly detection |

## 1. Introduction

The InnoBid Procurement System is designed to cater to three primary user roles: Vendor, Citizen, and Procurement Officer. Each role has a tailored set of functionalities and dashboards to facilitate their specific tasks within the procurement process. This documentation provides a comprehensive guide to understanding the capabilities and workflows for each user type, ensuring users can effectively navigate and utilize the system.

## 2. Vendor Role

Vendors are entities or individuals who bid on tenders. Their interface in InnoBid is focused on managing bids, tracking tender statuses, and analyzing performance metrics.

### 2.1 Vendor Dashboard
- **Path**: `/vendor`
- **Features**:
  - **Overview Stats**: Displays key metrics such as Active Bids, Won Tenders, Total Revenue, and Pending Evaluations.
  - **Time Range Selection**: Allows filtering data by week, month, quarter, or year to analyze performance over specific periods.
  - **Recent Activities**: Shows a list of recent actions like bid submissions or tender updates.
  - **Upcoming Deadlines**: Highlights approaching deadlines for tender submissions.
- **Purpose**: Provides a centralized view of all vendor activities, helping vendors monitor their engagement with tenders and track performance.

### 2.2 Vendor Tenders
- **Path**: `/vendor/tenders` and `/vendor/tenders-history`
- **Features**:
  - **Active Tenders**: View and apply for open tenders.
  - **Tender History**: Review past tenders, including outcomes and bid details.
  - **Bid Submission**: Interface to upload documents and submit bids for tenders.
- **Purpose**: Enables vendors to manage their participation in tenders, from application to historical analysis, ensuring they never miss opportunities.

### 2.3 Vendor Profile & Settings
- **Path**: `/vendor/profile`, `/vendor/settings`
- **Features**:
  - **Profile Management**: Update personal or company information.
  - **Settings**: Customize notification preferences and account settings.
  - **Feedback & Notifications**: Access system notifications and provide feedback on the procurement process.
- **Purpose**: Allows vendors to maintain accurate profile information and customize their experience within the system.

## 3. Citizen Role

Citizens are public users who can monitor procurement activities for transparency and report any irregularities they observe.

### 3.1 Citizen Dashboard
- **Path**: `/citizen`
- **Features**:
  - **Overview Stats**: Shows counts of Active Tenders, Recently Awarded Tenders, and Reported Irregularities.
  - **Recent Activity**: Displays recent system activities like new tenders or awards.
  - **Quick Links**: Direct access to view tenders, awarded contracts, report issues, or check statistics.
- **Purpose**: Offers citizens a snapshot of procurement activities, promoting transparency by providing easy access to relevant data.

### 3.2 Citizen Tenders & Reports
- **Path**: `/citizen/tenders`, `/citizen/awarded-tenders`, `/citizen/report`
- **Features**:
  - **View Tenders**: Access details of active tenders.
  - **Awarded Tenders**: Review details of awarded contracts, including winners.
  - **Report Irregularities**: Submit reports on suspected issues or corruption in tender processes.
- **Purpose**: Empowers citizens to stay informed about procurement outcomes and contribute to system integrity by reporting anomalies.

### 3.3 Citizen Statistics
- **Path**: `/citizen/statistics`
- **Features**:
  - **Tender Analytics**: View statistical data on tender distribution, award patterns, etc.
- **Purpose**: Provides analytical insights into procurement trends, enhancing public oversight.

## 4. Procurement Officer Role

Procurement Officers are responsible for managing the procurement process, from tender creation to bid evaluation and contract awarding.

### 4.1 Procurement Dashboard
- **Path**: `/procurement-officer`
- **Features**:
  - **Overview Stats**: Metrics on Open Tenders, Ongoing Evaluations, Contracts Awarded, Pending Approvals, Flagged Anomalies, and Vendor Queries.
  - **Time Range Selection**: Filter data by various time periods for targeted analysis.
  - **Recent Activities**: Tracks recent actions within the procurement scope.
  - **Anomaly Detection**: Visual representation of potential issues in bid evaluations.
- **Purpose**: Serves as the control center for procurement officers, offering a comprehensive view of all procurement activities and potential issues.

### 4.2 Tender Management
- **Path**: `/procurement-officer/tenders`, `/procurement-officer/tenders-history`
- **Features**:
  - **Create Tenders**: Set up new tenders with detailed specifications and criteria.
  - **Manage Tenders**: Update tender statuses, extend deadlines, or cancel tenders.
  - **Historical Data**: Review past tenders for compliance and performance analysis.
- **Purpose**: Facilitates the complete lifecycle management of tenders, ensuring smooth operation of procurement processes.

### 4.3 Evaluation & Reporting
- **Path**: `/procurement-officer/reports`
- **Features**:
  - **Bid Evaluation**: Tools to evaluate submitted bids, including AI-assisted analysis via CrewAI integration.
  - **Anomaly Flagging**: System alerts for potential irregularities in bids or processes.
  - **Vendor Communication**: Manage queries and interactions with vendors.
  - **Reporting**: Generate detailed reports on procurement outcomes and issues.
- **Purpose**: Equips officers with advanced tools for fair and transparent bid evaluation, anomaly detection, and comprehensive reporting to maintain integrity in procurement.
