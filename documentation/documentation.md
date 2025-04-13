# Technical Documentation for InnoBid Procurement System

## 1. Introduction

### 1.1 Overview
The InnoBid Procurement System is a comprehensive platform designed to streamline procurement processes for various stakeholders including vendors, citizens, and procurement officers. It integrates advanced AI capabilities for bid analysis through CrewAI and offers secure document storage with permanent URLs for future reference.

### 1.2 Purpose and Goals
The primary goal of InnoBid is to enhance transparency, efficiency, and fairness in procurement processes. It aims to provide a user-friendly interface for tender management, bid analysis, and document handling while ensuring compliance with anti-corruption standards.

### 1.3 Key Features
- **Role-Based Access Control**: Different dashboards for Vendors, Citizens, and Procurement Officers.
- **AI-Powered Bid Analysis**: Integration with CrewAI for intelligent bid evaluation.
- **Document Management**: Secure storage with permanent URLs to avoid expiration issues.
- **User Authentication**: Secure login and role management using NextAuth.js.
- **Responsive Design**: Mobile and desktop-friendly interface.

## 2. Architecture

### 2.1 High-Level Architecture Diagram
(Include a diagram here if possible, or describe the flow)
The architecture of InnoBid is built on a Next.js framework with server-side rendering for optimal performance. It uses Prisma as an ORM for database interactions, and integrates with external APIs like CrewAI for AI functionalities.

### 2.2 Components
- **Frontend**: Built with React and Next.js for dynamic UI/UX.
- **Backend**: Server actions and API routes handling business logic.
- **Database**: Managed through Prisma, likely using PostgreSQL or similar.
- **Authentication**: NextAuth.js for secure user management.
- **AI Integration**: CrewAI for bid analysis.

### 2.3 Data Flow
User requests are routed through Next.js middleware for authentication checks before accessing role-specific dashboards. Data is fetched from the database via Prisma, processed (sometimes through AI analysis), and presented through the UI.

## 3. Technology Stack

### 3.1 Core Technologies
- **Next.js (v14.0.4)**: Framework for server-side rendering and routing.
- **React (v18.2.0)**: UI library for building components.
- **TypeScript (v5.3.3)**: For type safety and better code maintainability.
- **Prisma (v6.2.1)**: ORM for database operations.
- **Tailwind CSS (v3.4.1)**: Styling framework for responsive design.

### 3.2 Authentication
- **NextAuth.js (v4.24.11)**: Handles user authentication and session management.

### 3.3 AI and Analytics
- **@ai-sdk/anthropic (v1.2.1)**: For AI capabilities, likely integrated with CrewAI.
- **Recharts (v2.15.1)**: For data visualization in dashboards.

### 3.4 UI Components
- **Shadcn-ui (v0.9.4)**: Custom UI components for consistent design.
- **Lucide-react (v0.469.0)**: Icon library for visual elements.

### 3.5 Justification
These technologies were chosen for their modern capabilities, community support, and performance optimizations suitable for a procurement system with memory constraints on user devices.

## 4. Setup and Installation

### 4.1 Prerequisites
- **Node.js**: Version 20.x or higher.
- **npm**: For package management.
- **Git**: For version control.

### 4.2 Installation Steps
1. Clone the repository from the source.
2. Navigate to the project directory: `cd innobid`.
3. Install dependencies: `npm install`.
4. Set up environment variables in a `.env` file based on the `.env.example` if provided.
5. Generate Prisma client: `npx prisma generate`.
6. Run the development server: `npm run dev`.

### 4.3 Configuration
- Configure database connection in `.env`.
- Adjust Next.js configurations in `next.config.js` for image optimization and server actions.

## 5. Authentication

### 5.1 Overview
InnoBid uses NextAuth.js for authentication, supporting role-based access for different user types (Vendor, Citizen, Procurement Officer).

### 5.2 Configuration
- Middleware (`middleware.ts`) checks user roles and redirects unauthorized access.
- Authentication providers are set up to handle login credentials securely.

### 5.3 Common Issues
- **Mixed Version Usage**: Ensure consistent use of NextAuth.js v5 patterns if upgraded.
- **Session Errors**: Check `.env` for correct `NEXTAUTH_SECRET`.

## 6. Bid Analysis Integration

### 6.1 CrewAI Integration
The system integrates with CrewAI for AI-based bid analysis. Bid data is formatted under a `bidData` key before being sent to the API.

### 6.2 Data Handling
- Complete bid data is fetched from the database to ensure accurate analysis.
- Memory optimization ensures minimal polling and efficient data transfer.

## 7. Document Storage

### 7.1 Strategy
Documents are stored with permanent URLs to ensure long-term accessibility, addressing previous issues with pre-signed URLs expiring.

### 7.2 Implementation
- Files are uploaded and stored in a manner that their URLs do not expire.
- Database records store these URLs for future reference without 404 errors.

## 8. Memory Optimization

### 8.1 Challenges
The application faced 'Fatal process out of memory' errors on systems with 8GB RAM, attempting to allocate excessive memory.

### 8.2 Solutions
- **Node Options**: Set `NODE_OPTIONS=--max-old-space-size=2048 --no-incremental` for dev and build scripts.
- **TypeScript**: Disabled incremental compilation in `tsconfig.json`.
- **Next.js Config**: Optimized webpack and image handling in `next.config.js`.

## 9. Deployment

### 9.1 Process
- Configured for Vercel deployment with `output: 'standalone'` in `next.config.js`.
- Environment variables are managed through Vercel or similar platforms.

### 9.2 CI/CD
- Automated builds on push to main branch if set up with Vercel or GitHub Actions.

## 10. Troubleshooting and FAQs

### 10.1 Common Errors
- **Memory Errors**: Adjust `NODE_OPTIONS` as described.
- **Authentication Issues**: Verify NextAuth.js setup and environment variables.
- **Build Failures**: Check for TypeScript errors or dependency conflicts.

### 10.2 FAQs
- **How to reset user password?**: Use the forgot password feature or admin panel.
- **How to access AI analysis?**: Available through specific dashboard sections post-login.

## 11. Appendix

### 11.1 Glossary
- **Next.js**: A React framework for production-ready web applications.
- **Prisma**: A next-generation ORM for Node.js and TypeScript.
- **CrewAI**: An AI service for bid analysis.

### 11.2 References
- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Prisma Documentation: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- NextAuth.js Documentation: [https://next-auth.js.org/](https://next-auth.js.org/)

## 12. API Documentation

### 12.1 Overview
The InnoBid Procurement System provides a RESTful API for various functionalities such as user authentication, bid management, tender operations, and AI analysis integration. These APIs are crucial for the frontend to interact with backend services.

### 12.2 API Structure
APIs are organized under the `app/api` directory, with each endpoint handling specific operations. They follow a consistent pattern for request handling, error management, and response formatting.

### 12.3 Authentication APIs
- **Register**: `POST /api/auth/register`
  - **Purpose**: Allows new users to register with the system.
  - **Request Body**: `{ name, email, password, role }`
  - **Response**: Success message with verification pending status or error if user exists.
  - **Implementation**: Handles email normalization, password hashing with bcrypt, and sends a verification email.
- **Other Auth Endpoints**: Include login and resend verification functionalities under `/api/auth/`.

### 12.4 Bid Management APIs
- **Evaluate Bid**: `POST /api/bids/evaluate`
  - **Purpose**: Submits a bid for evaluation.
  - **Request**: Bid data for evaluation.
  - **Response**: Evaluation results or error.
- **Final Evaluation**: `POST /api/bids/final-evaluation`
  - **Purpose**: Finalizes bid evaluation.
- **Bid Details**: `GET /api/bids/[id]`
  - **Purpose**: Retrieves specific bid information.

### 12.5 Tender Management APIs
- **Tender Bids**: `GET /api/tenders/[id]/bids`
  - **Purpose**: Fetches all bids for a specific tender.
- **Winning Bids**: `GET /api/tenders/[id]/winning-bids`
  - **Purpose**: Retrieves winning bids for a tender.

### 12.6 AI Analysis APIs
- **AI Agents**: `GET /api/crewai/ai-agents`
  - **Purpose**: Lists available AI agents for bid analysis.
- **AI Analysis**: `POST /api/crewai/ai-analysis`
  - **Purpose**: Submits data for AI analysis, formatted under `bidData` key.
- **Save Analysis**: `POST /api/crewai/ai-analysis/save`
  - **Purpose**: Saves AI analysis results.

### 12.7 File Operations APIs
- **Upload**: `POST /api/upload`
  - **Purpose**: Handles file uploads for documents related to bids or tenders.
- **Download**: `GET /api/download`
  - **Purpose**: Retrieves files using permanent URLs.

### 12.8 User Management APIs
- **Check Email**: `POST /api/user/check-email`
  - **Purpose**: Verifies if an email is already registered.
- **User Profile**: `GET /api/user/profile/[id]`
  - **Purpose**: Retrieves user profile details.
- **Update Profile**: `POST /api/user/updateProfile`
  - **Purpose**: Updates user information.
- **User Role**: `GET /api/user-role`
  - **Purpose**: Fetches the role of the logged-in user.

### 12.9 Miscellaneous APIs
- **Reset Password**: `POST /api/reset-password`
  - **Purpose**: Handles password reset requests.
- **Verify Email**: `POST /api/verify-email`
  - **Purpose**: Verifies user email using a token.

### 12.10 API Usage Guidelines
- **Authentication**: Most endpoints require user authentication; ensure proper session tokens are included.
- **Error Handling**: APIs return appropriate HTTP status codes (200 for success, 400 for bad request, 500 for server error) with descriptive messages.
- **Rate Limiting**: Be mindful of potential rate limiting on AI analysis endpoints.

## 13. Maintenance Guide for Future Developers

### 13.1 Understanding the Codebase
- **Project Structure**: Familiarize yourself with the Next.js structure, particularly `app/`, `components/`, `lib/`, and `api/` directories.
- **Key Files**:
  - `next.config.js`: Configuration for Next.js optimizations.
  - `tsconfig.json`: TypeScript settings for type safety.
  - `middleware.ts`: Authentication and role-based routing logic.

### 13.2 Development Workflow
- **Setup**: Follow the installation steps in Section 4. Ensure environment variables are correctly set.
- **Coding Standards**: Adhere to ESLint rules defined in `.eslintrc.json`. Use TypeScript for all new code.
- **Testing**: Currently, there may not be automated tests; manually test UI and API endpoints after changes.

### 13.3 Memory Optimization
- **Constraints**: The application is optimized for 8GB RAM systems. Monitor memory usage during development.
- **Adjustments**: If needed, tweak `NODE_OPTIONS` in deployment scripts or local environment.

### 13.4 API Maintenance
- **Extending APIs**: When adding new endpoints, follow the existing pattern of route organization and error handling as seen in `/api/auth/register/route.ts`.
- **Documentation**: Update this section with any new API endpoints or changes to existing ones.

### 13.5 Authentication and Security
- **NextAuth.js**: Understand the authentication flow in `middleware.ts`. Keep NextAuth.js updated but ensure compatibility with existing code.
- **Security**: Regularly update dependencies to patch security vulnerabilities using `npm audit fix`.

### 13.6 Deployment and Scaling
- **Vercel**: Use Vercel for deployment. Ensure `output: 'standalone'` is maintained in `next.config.js` for compatibility.
- **Scaling**: Monitor API response times, especially for AI analysis calls. Consider caching strategies if load increases.

### 13.7 Troubleshooting
- **Logs**: Check server logs for errors. API routes log detailed errors to the console.
- **Common Issues**: Refer to Section 10 for initial troubleshooting. Memory errors are a frequent concern; adjust configurations as needed.

### 13.8 Community and Support
- **References**: Utilize documentation links in the Appendix for Next.js, Prisma, and NextAuth.js.
- **External Help**: Engage with community forums or Stack Overflow for complex issues not covered here.

### 13.9 Future Enhancements
- **Testing**: Implement automated testing frameworks like Jest for unit and integration tests.
- **Performance**: Explore further optimizations in Next.js for image loading and server actions.
- **Features**: Consider adding real-time notifications or advanced analytics based on user feedback.
