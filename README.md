# InnovBid Procurement System

![InnoBid Logo](https://example.com/logo.png)

## Overview

InnoBid is a comprehensive procurement platform designed to streamline procurement processes for various stakeholders including vendors, citizens, and procurement officers. The system integrates advanced AI capabilities for bid analysis through CrewAI and offers secure document storage with permanent URLs for future reference.

## Key Features

- **Role-Based Access Control**: Different dashboards for Vendors, Citizens, and Procurement Officers
- **AI-Powered Bid Analysis**: Integration with CrewAI for intelligent bid evaluation
- **Document Management**: Secure storage with permanent URLs
- **User Authentication**: Secure login and role management using NextAuth.js v5
- **Subscription System**: Standard ($99/month) and AI ($199/month) plans for procurement officers
- **Responsive Design**: Mobile and desktop-friendly interface

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Backend**: Next.js API routes and server actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **File Storage**: AWS S3
- **Payment Processing**: Stripe
- **AI Integration**: CrewAI

## Installation

### Prerequisites

- Node.js (v20.x or higher)
- npm or yarn
- PostgreSQL database
- AWS S3 bucket for file storage
- Stripe account for subscription management

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/bizzy604/my-app.git
   cd my-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.development
   ```
   Edit `.env.development` with your own values for:
   - Database connection
   - AWS credentials
   - NextAuth secret
   - Stripe API keys
   - CrewAI API keys

4. Generate Prisma client
   ```bash
   npx prisma generate
   ```

5. Run database migrations
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server
   ```bash
   npm run dev
   ```

## User Roles

### Vendor

- **Dashboard**: View active bids, won tenders, revenue, and pending evaluations
- **Tenders**: Apply for open tenders and review tender history
- **Profile**: Manage company information and settings

### Citizen

- **Dashboard**: Monitor active tenders, awarded contracts, and reported irregularities
- **Tenders**: View active and awarded tenders
- **Reports**: Submit reports on suspected issues in tender processes
- **Statistics**: Access analytical insights into procurement trends

### Procurement Officer

- **Dashboard**: Track open tenders, evaluations, contracts, and anomalies
- **Tender Management**: Create and manage tenders
- **Evaluation**: Use AI-assisted tools to evaluate bids
- **Reports**: Generate detailed reports on procurement outcomes

## Subscription System

InnovBid offers two subscription plans for procurement officers:

- **Standard Plan** ($99/month): Access to core procurement features
- **AI Plan** ($199/month): Adds AI-based bid analysis capabilities

Subscriptions are managed through Stripe integration.

## Memory Optimization

The application is optimized to run on systems with limited RAM (8GB):

- `NODE_OPTIONS=--max-old-space-size=2048 --no-incremental` for dev and build scripts
- Disabled TypeScript incremental compilation
- Optimized webpack configuration in next.config.js

## Security Features

- Role-based access control through middleware
- Secure authentication with NextAuth.js
- Environment variable protection
- AWS S3 secure document storage

## API Documentation

The system provides RESTful APIs for various functionalities:

- Authentication: `/api/auth/*`
- Bid Management: `/api/bids/*`
- Tender Management: `/api/tenders/*`
- AI Analysis: `/api/crewai/*`
- File Operations: `/api/upload`, `/api/download`
- User Management: `/api/user/*`

## Troubleshooting

### Common Issues

- **Memory Errors**: Adjust `NODE_OPTIONS` as described in Memory Optimization
- **Authentication Issues**: Verify NextAuth.js setup and environment variables
- **Build Failures**: Check for TypeScript errors or dependency conflicts

## License

[MIT License](LICENSE)

## Contact

For support or inquiries, please contact [hello@innobid.net](mailto:hello@innobid.net), our developer is available 24/7. [kevinamoni20@gmail.com](mailto:kevinamoni20@gmail.com)